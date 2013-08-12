namespace Sitecore.Analytics.DataGenerator
{
  using System;
  using System.Web.UI;

  public partial class Service : Page
  {
    protected void Page_Load(object sender, EventArgs e)
    {
      var json = "{\"namespace\":\"Sitecore.Analytics.DataGenerator\"}";
      this.Response.Clear();
      this.Response.ContentType = "application/json; charset=utf-8";
      this.Response.Write(json);
      this.Response.End();
    }
  }
}