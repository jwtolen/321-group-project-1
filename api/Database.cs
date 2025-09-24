using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using SQLitePCL;

namespace api.Models
{
    public class Database
    {
        private string cs = "Data Source=listings.db";

        public void InitializeDatabase()
        {
            using var con = new SqliteConnection(cs);
            con.Open();
            
            string createTable = @"CREATE TABLE IF NOT EXISTS ItemListings (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Price TEXT NOT NULL,
                Category TEXT NOT NULL,
                Condition TEXT NOT NULL,
                SellerContact TEXT NOT NULL,
                Description TEXT NOT NULL,
                ItemPhoto TEXT,
                SellerPhoto TEXT,
                SellerUniversity TEXT
            )";
            
            using var cmd = new SqliteCommand(createTable, con);
            cmd.ExecuteNonQuery();
        }

        public List<ItemListing> GetListings()
        {
            string stm = "SELECT * FROM ItemListings";
            List<ItemListing> listings = new List<ItemListing>();
            using var con = new SqliteConnection(cs);
            con.Open();
            using var cmd = new SqliteCommand(stm, con);
            using var rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                listings.Add(new ItemListing()
                {
                    Id = rdr.GetInt32(0),
                    Title = rdr.GetString(1),
                    Price = rdr.GetString(2),
                    Category = rdr.GetString(3),
                    Condition = rdr.GetString(4),
                    SellerContact = rdr.GetString(5),
                    Description = rdr.GetString(6),
                    ItemPhoto = rdr.IsDBNull(7) ? "" : rdr.GetString(7),
                    SellerPhoto = rdr.IsDBNull(8) ? "" : rdr.GetString(8),
                    SellerUniversity = rdr.IsDBNull(9) ? "" : rdr.GetString(9)
                });
            }
            return listings;
        }

        public void DeleteListing(int id)
        {
            string stm = "DELETE FROM ItemListings WHERE Id = @id";
            using var con = new SqliteConnection(cs);
            con.Open();
            using var cmd = new SqliteCommand(stm, con);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.ExecuteNonQuery();
        }

        public void UpdateListing(ItemListing listing)
        {
            string stm = @"UPDATE ItemListings 
                          SET Title = @Title, Price = @Price, Category = @Category, 
                              Condition = @Condition, SellerContact = @SellerContact, 
                              Description = @Description, ItemPhoto = @ItemPhoto, 
                              SellerPhoto = @SellerPhoto, SellerUniversity = @SellerUniversity 
                          WHERE Id = @Id";
            
            using var con = new SqliteConnection(cs);
            con.Open();
            using var cmd = new SqliteCommand(stm, con);
            cmd.Parameters.AddWithValue("@Id", listing.Id);
            cmd.Parameters.AddWithValue("@Title", listing.Title ?? "");
            cmd.Parameters.AddWithValue("@Price", listing.Price ?? "");
            cmd.Parameters.AddWithValue("@Category", listing.Category ?? "");
            cmd.Parameters.AddWithValue("@Condition", listing.Condition ?? "");
            cmd.Parameters.AddWithValue("@SellerContact", listing.SellerContact ?? "");
            cmd.Parameters.AddWithValue("@Description", listing.Description ?? "");
            cmd.Parameters.AddWithValue("@ItemPhoto", listing.ItemPhoto ?? "");
            cmd.Parameters.AddWithValue("@SellerPhoto", listing.SellerPhoto ?? "");
            cmd.Parameters.AddWithValue("@SellerUniversity", listing.SellerUniversity ?? "");
            
            cmd.ExecuteNonQuery();
        }

        public void AddListing(ItemListing listing)
        {
            string stm = @"INSERT INTO ItemListings (Id, Title, Price, Category, Condition, SellerContact, Description, ItemPhoto, SellerPhoto, SellerUniversity) 
                          VALUES (@Id, @Title, @Price, @Category, @Condition, @SellerContact, @Description, @ItemPhoto, @SellerPhoto, @SellerUniversity)";
            
            using var con = new SqliteConnection(cs);
            con.Open();
            using var cmd = new SqliteCommand(stm, con);
            cmd.Parameters.AddWithValue("@Id", listing.Id);
            cmd.Parameters.AddWithValue("@Title", listing.Title ?? "");
            cmd.Parameters.AddWithValue("@Price", listing.Price ?? "");
            cmd.Parameters.AddWithValue("@Category", listing.Category ?? "");
            cmd.Parameters.AddWithValue("@Condition", listing.Condition ?? "");
            cmd.Parameters.AddWithValue("@SellerContact", listing.SellerContact ?? "");
            cmd.Parameters.AddWithValue("@Description", listing.Description ?? "");
            cmd.Parameters.AddWithValue("@ItemPhoto", listing.ItemPhoto ?? "");
            cmd.Parameters.AddWithValue("@SellerPhoto", listing.SellerPhoto ?? "");
            cmd.Parameters.AddWithValue("@SellerUniversity", listing.SellerUniversity ?? "");
            
            cmd.ExecuteNonQuery();
        }

        public void SeedFromJson()
        {
            try
            {
                // Check if database already has data
                var existingListings = GetListings();
                if (existingListings.Count > 0) 
                {
                    Console.WriteLine($"Database already has {existingListings.Count} listings, skipping seed");
                    return; // Already seeded
                }

                // Read from JSON file
                string jsonPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "itemListings.json");
                Console.WriteLine($"Looking for JSON file at: {jsonPath}");
                Console.WriteLine($"File exists: {File.Exists(jsonPath)}");
                
                if (!File.Exists(jsonPath))
                {
                    Console.WriteLine("JSON file not found, skipping seed");
                    return;
                }
                
                string json = File.ReadAllText(jsonPath);
                var listings = JsonConvert.DeserializeObject<List<ItemListing>>(json);
                
                if (listings == null)
                {
                    Console.WriteLine("Failed to deserialize JSON data");
                    return;
                }
                
                Console.WriteLine($"Found {listings.Count} listings to seed");

                // Insert into SQLite
                using var con = new SqliteConnection(cs);
                con.Open();
                
                Console.WriteLine("Starting to insert listings into SQLite...");
                int insertedCount = 0;
                
                foreach (var listing in listings)
                {
                    try
                    {
                        string insertSql = @"INSERT INTO ItemListings (Id, Title, Price, Category, Condition, SellerContact, Description, ItemPhoto, SellerPhoto, SellerUniversity) 
                                           VALUES (@Id, @Title, @Price, @Category, @Condition, @SellerContact, @Description, @ItemPhoto, @SellerPhoto, @SellerUniversity)";
                        
                        using var cmd = new SqliteCommand(insertSql, con);
                        cmd.Parameters.AddWithValue("@Id", listing.Id);
                        cmd.Parameters.AddWithValue("@Title", listing.Title ?? "");
                        cmd.Parameters.AddWithValue("@Price", listing.Price ?? "");
                        cmd.Parameters.AddWithValue("@Category", listing.Category ?? "");
                        cmd.Parameters.AddWithValue("@Condition", listing.Condition ?? "");
                        cmd.Parameters.AddWithValue("@SellerContact", listing.SellerContact ?? "");
                        cmd.Parameters.AddWithValue("@Description", listing.Description ?? "");
                        cmd.Parameters.AddWithValue("@ItemPhoto", listing.ItemPhoto ?? "");
                        cmd.Parameters.AddWithValue("@SellerPhoto", listing.SellerPhoto ?? "");
                        cmd.Parameters.AddWithValue("@SellerUniversity", listing.SellerUniversity ?? "");
                        
                        cmd.ExecuteNonQuery();
                        insertedCount++;
                        Console.WriteLine($"Inserted listing: {listing.Title}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error inserting listing {listing.Title}: {ex.Message}");
                    }
                }
                
                Console.WriteLine($"Successfully inserted {insertedCount} out of {listings.Count} listings");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SeedFromJson: {ex.Message}");
            }
        }

        public void ClearAndReseed()
        {
            try
            {
                // Clear all existing data
                using var con = new SqliteConnection(cs);
                con.Open();
                using var cmd = new SqliteCommand("DELETE FROM ItemListings", con);
                cmd.ExecuteNonQuery();
                Console.WriteLine("Cleared existing data from database");
                
                // Now seed from JSON
                SeedFromJson();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ClearAndReseed: {ex.Message}");
            }
        }
    }
}