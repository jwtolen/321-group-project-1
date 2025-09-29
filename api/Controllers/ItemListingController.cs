using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using api.Models;
using api; 

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemListingController : ControllerBase
    {
        // GET: api/<ItemListingController>
        [HttpGet]
        public List<ItemListing> Get()
        {
            Database database = new Database();
            database.InitializeDatabase();
            database.SeedFromJson();
            return database.GetListings();
        }

        // GET api/<ItemListingController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<ItemListingController>
        [HttpPost]
        public IActionResult Post([FromBody] ItemListing listing)
        {
            Database database = new Database();
            database.InitializeDatabase();
            database.AddListing(listing);
            return CreatedAtAction(nameof(Get), new { id = listing.Id }, listing);
        }

        // PUT api/<ItemListingController>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] ItemListing listing)
        {
            if (id != listing.Id)
            {
                return BadRequest();
            }

            Database database = new Database();
            database.InitializeDatabase();
            
            // Get the existing listing to verify password
            var existingListings = database.GetListings();
            var existingListing = existingListings.FirstOrDefault(l => l.Id == id);
            
            if (existingListing == null)
            {
                return NotFound();
            }
            
            // Check if password matches (if provided)
            if (!string.IsNullOrEmpty(listing.PostPassword) && existingListing.PostPassword != listing.PostPassword)
            {
                return Unauthorized(new { message = "Invalid password" });
            }
            
            database.UpdateListing(listing);
            return NoContent();
        }

        // DELETE api/<ItemListingController>/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id, [FromBody] PasswordRequest passwordRequest)
        {
            Database database = new Database();
            database.InitializeDatabase();
            
            // Get the existing listing to verify password
            var existingListings = database.GetListings();
            var existingListing = existingListings.FirstOrDefault(l => l.Id == id);
            
            if (existingListing == null)
            {
                return NotFound();
            }
            
            // Check if password matches
            if (existingListing.PostPassword != passwordRequest.Password)
            {
                return Unauthorized(new { message = "Invalid password" });
            }
            
            database.DeleteListing(id);
            return NoContent();
        }
        
        // POST api/<ItemListingController>/verify-password
        [HttpPost("verify-password")]
        public IActionResult VerifyPassword([FromBody] PasswordVerificationRequest request)
        {
            Database database = new Database();
            database.InitializeDatabase();
            
            var existingListings = database.GetListings();
            var existingListing = existingListings.FirstOrDefault(l => l.Id == request.Id);
            
            if (existingListing == null)
            {
                return NotFound();
            }
            
            if (existingListing.PostPassword != request.Password)
            {
                return Unauthorized(new { message = "Invalid password" });
            }
            
            return Ok(new { message = "Password verified" });
        }

        // POST api/<ItemListingController>/reseed
        [HttpPost("reseed")]
        public IActionResult Reseed()
        {
            Database database = new Database();
            database.InitializeDatabase();
            database.ClearAndReseed();
            return Ok(new { message = "Database reseeded successfully" });
        }
    }
    
    public class PasswordRequest
    {
        public string Password { get; set; } = "";
    }
    
    public class PasswordVerificationRequest
    {
        public int Id { get; set; }
        public string Password { get; set; } = "";
    }
}
