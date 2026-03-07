export default async function handler(req, res) {

  const { type } = req.query;

  const csv = `
order_id,amount,status,date
1001,5000,success,2026-03-10
1002,2000,failed,2026-03-10
`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${type}-report.csv`);

  res.status(200).send(csv);

}
