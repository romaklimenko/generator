namespace Sitecore.Analytics.DataGenerator.Api
{
  using System;
  using System.Web.UI;
  using Newtonsoft.Json;

  using Sitecore.Analytics.Data.DataAccess.DataAdapters;

  public class Campaigns : Page
  {
    protected void Page_Load(object sender, EventArgs e)
    {
      const string query =
@"SELECT
	Campaigns.CampaignId,
	CASE
		WHEN
			ISNULL(Campaigns.Category1Label, '') <> ''
		THEN Campaigns.Category1Label + '/'
		ELSE ''
	END
	+
	CASE
		WHEN
			ISNULL(Campaigns.Category2Label, '') <> ''
		THEN Campaigns.Category2Label + '/'
		ELSE ''
	END
	+
	CASE
		WHEN
			ISNULL(Campaigns.Category3Label, '') <> ''
		THEN Campaigns.Category3Label + '/'
		ELSE ''
	END
	+
	CampaignName AS Campaign
FROM
	Campaigns
ORDER BY
	Campaigns.Category1Label,
	Campaign";

      var result = DataAdapterManager.Sql.ReadMany(
        query,
        reader =>
        {
          var array = new object[2];
          reader.InnerReader.GetValues(array);
          return new
          {
            CampaignId = array[0].ToString(),
            CampaignPath = array[1].ToString()
          };
        },
        new object[] { });

      var json = JsonConvert.SerializeObject(result);

      this.Response.Clear();
      this.Response.ContentType = "application/json; charset=utf-8";
      this.Response.Write(json);
      this.Response.End();
    }
  }
}