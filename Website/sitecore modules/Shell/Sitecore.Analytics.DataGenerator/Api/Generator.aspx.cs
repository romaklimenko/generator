namespace Sitecore.Analytics.DataGenerator.Api
{
  using System;
  using System.Linq;
  using System.Collections.Generic;
  using System.Data.SqlTypes;
  using System.Web.UI;
  using Newtonsoft.Json;
  using Newtonsoft.Json.Linq;

  using Sitecore.Analytics.Data.DataAccess.DataAdapters;

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
      var campaignId = Request.Params["campaignId"];

      var datesJson = JsonConvert.DeserializeObject(data) as JArray;

      if (datesJson == null)
      {
        return;
      }

      var list = new List<TrafficPoint>();

      foreach (JToken jToken in datesJson)
      {
        var trafficPoint = new TrafficPoint
                             {
                               DateString = jToken["date"].Value<string>(),
                               Visits = jToken["visits"].Value<int>(),
                               Value = jToken["value"].Value<int>()
                             };
        list.Add(trafficPoint);
      }

      list = list.OrderBy(x => x.DateString).ToList();

      for (var i = 1; i < list.Count; i++)
      {
        var from = list[i - 1];
        var to = list[i];
        this.Generate(campaignId, from.DateString, to.DateString, to.Visits, to.Value);
      }

      var json = JsonConvert.SerializeObject(data);

      this.Response.Clear();
      this.Response.ContentType = "application/json; charset=utf-8";
      this.Response.Write(json);
      this.Response.End();
    }

    private void Generate(string campaignId, string fromDateString, string toDateString, int visits, int value)
    {
      // see generator.sql for details
      if (visits == 0)
      {
        return;
      }

      var query = @"
DECLARE @campaignId UNIQUEIDENTIFIER = {2}campaignIdParam{3}
DECLARE @visits INT = {2}visitsParam{3}
DECLARE @value INT = {2}valueParam{3}
DECLARE @from DATETIME = {2}fromParam{3}
DECLARE @to DATETIME = {2}toParam{3}

WHILE @visits > 0
BEGIN
	DECLARE @randomShift INT = CONVERT(INT, DATEDIFF(DAY, @from, @to) * RAND())
	DECLARE @date DATETIME = DATEADD(DAY, @randomShift, @from)
	DECLARE @randomValue INT = CONVERT(INT, @value * RAND())

	SET @value = @value - @randomValue
	SET @visits = @visits - 1

	DECLARE @visitorId UNIQUEIDENTIFIER = NEWID()
	DECLARE @visitId UNIQUEIDENTIFIER = NEWID()

	-- insert Visitor
	INSERT INTO [dbo].[Visitors]
	(	[VisitorId],
		[VisitorClassification],
		[OverrideVisitorClassification],
		[VisitCount],
		[Value],
		[AuthenticationLevel],
		[ExternalUser],
		[IntegrationId],
		[IntegrationLabel])
     SELECT
		@visitorId,
		0,
		0,
		1,
		@randomValue,
		0,
		'',
		'00000000-0000-0000-0000-000000000000',
		''

	-- insert Visit
	INSERT INTO [dbo].[Visits]
	(	[VisitId],
		[VisitorId],
		[VisitorVisitIndex],
		[VisitPageCount],
		[StartDateTime],
		[EndDateTime],
		[TrafficType],
		[Value],
		[AspNetSessionId],
		[ReferringSiteId],
		[KeywordsId],
		[BrowserId],
		[UserAgentId],
		[OsId],
		[ScreenId],
		[CampaignId],
		[RDNS],
		[MultiSite],
		[LocationId],
		[Ip],
		[BusinessName],
		[City],
		[PostalCode],
		[MetroCode],
		[AreaCode],
		[Region],
		[IspName],
		[Country],
		[Latitude],
		[Longitude],
		[TestSetId],
		[TestValues],
		[Referrer],
		[State],
		[StateChanged],
		[DeviceName],
		[Language])
	SELECT
		@visitId,
		@visitorId,
		1,
		1,
		@date,
		DATEADD(HOUR, 1, @date),
		20,
		@randomValue,
		'gkbuhf2nyzcyk2jwp0oyyo3o',
		'D98C1DD4-008F-04B2-E980-0998ECF8427E',
		'D98C1DD4-008F-04B2-E980-0998ECF8427E',
		'1560B76E-BC07-7CB2-F841-F1294F5C0E71',
		'9E979377-BB70-E201-3833-A4F7789D7A63',
		'D584C532-47E8-FF89-8852-6E3E788E6EFD',
		'76C01BCB-09D0-43A5-B12B-797D99C9CA2F',
		@campaignId,
		'127.0.0.1',
		'website',
		'D98C1DD4-008F-04B2-E980-0998ECF8427E',
		0x7F000001,
		'IP_NOT_FOUND',
		'',
		'',
		'',
		'',
		'',
		'',
		'N/A',
		0,
		0,
		NULL,
		NULL,
		'',
		1,
		@date,
		'Default',
		'en'

	-- insert Page
	INSERT INTO [dbo].[Pages]
	(	[PageId],
		[VisitId],
		[VisitorId],
		[VisitPageIndex],
		[DateTime],
		[ItemId],
		[ItemLanguage],
		[ItemVersion],
		[DeviceId],
		[Url],
		[UrlText],
		[TestSetId],
		[TestValues],
		[Duration],
		[Data],
		[DeviceName])
	SELECT
		NEWID(),
		@visitId,
		@visitorId,
		1,
		@date,
		'110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
		'en',
		1,
		'FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3',
		'/',
		'/',
		NULL,
		NULL,
		10000,
		'',
		'Default'
END
";
      var @params = new object[]
                      {
                        "campaignIdParam", campaignId,
                        "visitsParam", visits,
                        "valueParam", value,
                        "fromParam", fromDateString,
                        "toParam", toDateString
                      };

      DataAdapterManager.Sql.Execute(
        query,
        @params);
    }
  }
}