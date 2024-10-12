using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using AssetItems.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetItemApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";

        // GET: api/AssetApi/GetAssetsByCategory?categoryID=1
        [HttpGet("GetAssetsByCategory")]
        public async Task<IActionResult> GetAssetsByCategoryAsync(int categoryID)
        {
            const string query = "SELECT * FROM asset_item_tb WHERE CategoryID = @CategoryID";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var assets = await connection.QueryAsync<AssetItem>(query, new { CategoryID = categoryID });
                return Ok(assets); // Return filtered assets based on CategoryID
            }
        }

        // POST: api/AssetApi/InsertAsset
        [HttpPost("InsertAsset")]
        public async Task<IActionResult> InsertAssetAsync(AssetItem newAsset)
        {
            const string query = @"
    INSERT INTO asset_item_tb 
    (CategoryID, AssetName, DatePurchased, DateIssued, IssuedTo, CheckedBy, Cost, Location, AssetCode, Remarks, DepreciationRate, DepreciationValue, DepreciationPeriodType, DepreciationPeriodValue) 
    VALUES 
    (@CategoryID, @AssetName, @DatePurchased, @DateIssued, @IssuedTo, @CheckedBy, @Cost, @Location, @AssetCode, @Remarks, @DepreciationRate, @DepreciationValue, @DepreciationPeriodType, @DepreciationPeriodValue);
    SELECT * FROM asset_item_tb ORDER BY AssetId DESC LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<AssetItem>(query, new
                {
                    newItem.CategoryID,
                    newItem.AssetName,
                    newItem.DatePurchased,
                    newItem.DateIssued,
                    newItem.IssuedTo,
                    newItem.CheckedBy,
                    newItem.Cost,
                    newItem.Location,
                    newItem.AssetCode,
                    newItem.Remarks,
                    newItem.DepreciationRate,
                    newItem.DepreciationPeriodType, // "month" or "year"
                    newItem.DepreciationPeriodValue  // number of months or years
                });


                return Ok(result); // Return the newly inserted asset
            }
        }

        // DELETE: api/AssetApi/DeleteAsset?AssetID=1
        [HttpDelete("DeleteAsset")]
        public async Task<IActionResult> DeleteAssetAsync(int CategoryID, string AssetCode)
        {
            const string query = "DELETE FROM asset_item_tb WHERE CategoryID = @CategoryID AND AssetCode = @AssetCode";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(query, new { CategoryID, AssetCode });
                return Ok(new { success = result > 0 });
            }
        }

        // PUT: api/AssetApi/UpdateAsset
        [HttpPut("UpdateAsset")]
        public async Task<IActionResult> UpdateAssetAsync(int CategoryID, string AssetCode, AssetItem updatedAsset)
        {
            const string query = @"
                UPDATE asset_item_tb 
                SET 
                    AssetName = @AssetName, 
                    DatePurchased = @DatePurchased,
                    DateIssued = @DateIssued,
                    IssuedTo = @IssuedTo,
                    CheckedBy = @CheckedBy,
                    Cost = @Cost,
                    Location = @Location,
                    Remarks = @Remarks,
                    DepreciationRate = @DepreciationRate,
                    DepreciationValue = @DepreciationValue
                WHERE CategoryID = @CategoryID AND AssetCode = @AssetCode;
                SELECT * FROM asset_item_tb WHERE CategoryID = @CategoryID AND AssetCode = @AssetCode LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<AssetItem>(query, new
                {
                    updatedAsset.AssetName,
                    updatedAsset.DatePurchased,
                    updatedAsset.DateIssued,
                    updatedAsset.IssuedTo,
                    updatedAsset.CheckedBy,
                    updatedAsset.Cost,
                    updatedAsset.Location,
                    updatedAsset.Remarks,
                    updatedAsset.DepreciationRate,
                    updatedAsset.DepreciationValue,
                    CategoryID,
                    AssetCode
                });

                return Ok(result);
            }
        }
    }
}