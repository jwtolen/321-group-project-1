using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using Newtonsoft.Json;

namespace api
{
    public class ItemListingFile
    {
        private string itemListingFile = "itemListings.json";

        public List<ItemListing> GetItemListings()
        {
            string json = File.ReadAllText(itemListingFile);
            return JsonConvert.DeserializeObject<List<ItemListing>>(json);
        }
    }
}