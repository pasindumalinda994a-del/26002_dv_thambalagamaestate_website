type EntranceTableProps = {
  headers: [string, string, string, string];
  rows: [string, string, string, string][];
};

export function EntranceTable({ headers, rows }: EntranceTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden border border-[#CFCBB1] md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-deep-forest">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-left font-space-grotesk text-base font-bold uppercase leading-[150%] tracking-[0.2px] text-cream"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row[0]}
                className={index % 2 === 0 ? "bg-[#F0ECCF]" : "bg-cream"}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${row[0]}-${cellIndex}`}
                    className={[
                      "px-5 py-6 font-secondary text-base leading-[150%] tracking-[0.2px] text-deep-forest",
                      cellIndex === 0
                        ? "font-space-grotesk font-bold uppercase"
                        : "font-normal",
                    ].join(" ")}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row, index) => (
          <div
            key={row[0]}
            className={[
              "flex flex-col gap-2 border border-[#CFCBB1] px-4 py-4",
              index % 2 === 0 ? "bg-[#F0ECCF]" : "bg-cream",
            ].join(" ")}
          >
            <p className="font-space-grotesk text-base font-bold uppercase text-deep-forest">
              {row[0]}
            </p>
            {headers.slice(1).map((header, i) => (
              <p
                key={header}
                className="font-secondary text-sm leading-[150%] text-forest-green"
              >
                <span className="font-medium uppercase text-olive">
                  {header}:{" "}
                </span>
                {row[i + 1]}
              </p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
