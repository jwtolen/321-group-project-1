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
            database.UpdateListing(listing);
            return NoContent();
        }

        // DELETE api/<ItemListingController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            Database database = new Database();
            database.DeleteListing(id);
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
}
