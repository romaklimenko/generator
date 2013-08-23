namespace Sitecore.Analytics.DataGenerator.Api
{
  using System;
  using System.Web.UI;
  using Newtonsoft.Json;

  using Sitecore.Analytics.Data.DataAccess.DataAdapters;

  public class Visits : Page
  {
    protected void Page_Load(object sender, EventArgs e)
    {
      var campaignId = Request.Params["campaignid"];

      var @params = new object[] { };

      string query;
      // todo: sql injection
      if (string.IsNullOrEmpty(campaignId))
      {
        query =
@"
SELECT
  CONVERT(VARCHAR, Visits.StartDateTime, 112) as [Date],
  COUNT(*) as Visits,
  SUM(Visits.Value) as Value,
  SUM(Visits.Value) / COUNT(*) as ValuePerVisit
FROM
  Visits
GROUP BY
  CONVERT(VARCHAR, Visits.StartDateTime, 112)
ORDER BY
  [Date]";
      }
      else
      {
        query =
@"
SELECT
  CONVERT(VARCHAR, Visits.StartDateTime, 112) as [Date],
  COUNT(*) as Visits,
  SUM(Visits.Value) as Value,
  SUM(Visits.Value) / COUNT(*) as ValuePerVisit
FROM
  Visits
WHERE
	Visits.CampaignId = {2}campaignId{3}
GROUP BY
  CONVERT(VARCHAR, Visits.StartDateTime, 112)
ORDER BY
  [Date]";

        @params = new object[] { "campaignId", campaignId };
      }

      var result = DataAdapterManager.Sql.ReadMany(
        query,
        reader =>
        {
          var array = new object[4];
          reader.InnerReader.GetValues(array);
          return new
          {
            Date = array[0].ToString(),
            Visits = array[1].ToString(),
            Value = array[2].ToString(),
            ValuePerVisit = array[3].ToString()
          };
        },
        @params);

      var json = JsonConvert.SerializeObject(result);

      this.Response.Clear();
      this.Response.ContentType = "application/json; charset=utf-8";
      this.Response.Write(json);
      this.Response.End();
    }
  }
}