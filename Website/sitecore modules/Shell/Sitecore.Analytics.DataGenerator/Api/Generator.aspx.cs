namespace Sitecore.Analytics.DataGenerator.Api
{
  using System;
  using System.Linq;
  using System.Collections.Generic;
  using System.Data.SqlTypes;
  using System.Web.UI;
  using Newtonsoft.Json;
  using Newtonsoft.Json.Linq;

  class TrafficPoint
  {
    public string DateString { get; set; }
    public int Visits { get; set; }
    public int Value { get; set; }
  }

  public class Generator : Page
  {
    protected void Page_Load(object sender, EventArgs e)
    {
      var data = Request.Params["data"];

      var datesJson = JsonConvert.DeserializeObject(data) as JArray;

      if (datesJson == null)
      {
        return;
      }

      var dictionary = new Dictionary<string, TrafficPoint>();

      foreach (JToken jToken in datesJson)
      {
        var trafficPoint = new TrafficPoint
                             {
                               DateString = jToken["date"].Value<string>(),
                               Visits = jToken["visits"].Value<int>(),
                               Value = jToken["value"].Value<int>()
                             };
        dictionary.Add(trafficPoint.DateString, trafficPoint);
      }

      var json = JsonConvert.SerializeObject(data);

      this.Response.Clear();
      this.Response.ContentType = "application/json; charset=utf-8";
      this.Response.Write(json);
      this.Response.End();
    }

    private void Generate(string fromDateString, string toDateString, int visits, int value)
    {
      if (visits == 0)
      {
        return;
      }
    }
  }
}