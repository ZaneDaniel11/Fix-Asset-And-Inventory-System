using System;

namespace AssetItems.Models
{
    public class AssetItem
    {
        public int CategoryID { get; set; }            // Foreign key to category
        public string AssetName { get; set; }          // Name of the asset
        public DateTime DatePurchased { get; set; }    // Date when the asset was purchased
        public DateTime? DateIssued { get; set; }      // Date when the asset was issued (nullable)
        public string IssuedTo { get; set; }           // Person the asset was issued to
        public string CheckedBy { get; set; }          // Name of the person who checked the asset
        public decimal Cost { get; set; }              // Cost of the asset
        public string Location { get; set; }           // Location of the asset
        public string AssetCode { get; set; }          // Unique code for the asset
        public string Remarks { get; set; }            // Additional remarks or notes about the asset
        public decimal? DepreciationRate { get; set; } // Depreciation rate of the asset (nullable)
        public decimal? DepreciationValue { get; set; }// Depreciation value of the asset (nullable)

        public string DepreciationPeriodType { get; set; } // "month" or "year"
        public int DepreciationPeriodValue { get; set; }
    }
}
