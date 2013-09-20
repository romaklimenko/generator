select
  CONVERT(VARCHAR, Visits.StartDateTime, 112) as [Date],
  COUNT(*) as VisitsCount,
  SUM(Visits.Value) as Value,
  SUM(Visits.Value) / COUNT(*) as ValuePerVisit
from
  Visits
where
  Visits.CampaignId = 'DF191725-14D0-43AF-861E-9D11D05ADCAC'
group by
  CONVERT(VARCHAR, Visits.StartDateTime, 112)
order by
  [Date]