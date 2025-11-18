using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace api.Models
{
    public class ItemListing
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        
        [JsonProperty("title")]
        public string? Title { get; set; }
        
        [JsonProperty("price")]
        public string? Price { get; set; }
        
        [JsonProperty("category")]
        public string? Category { get; set; }
        
        [JsonProperty("condition")]
        public string? Condition { get; set; }
        
        [JsonProperty("sellerContact")]
        public string? SellerContact { get; set; }
        
        [JsonProperty("sellerName")]
        public string? SellerName { get; set; }
        
        [JsonProperty("description")]
        public string? Description { get; set; }
        
        [JsonProperty("itemPhoto")]
        public string? ItemPhoto { get; set; }
        
        [JsonProperty("sellerPhoto")]
        public string? SellerPhoto { get; set; }
        
        [JsonProperty("sellerUniversity")]
        public string? SellerUniversity { get; set; }
        
        [JsonProperty("postPassword")]
        public string? PostPassword { get; set; }
        
        [JsonProperty("isVerified")]
        public bool IsVerified { get; set; }
        
        [JsonProperty("isCarryAway")]
        public bool IsCarryAway { get; set; }
    }

}