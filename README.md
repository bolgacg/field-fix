# Bucket off grade, or no RTK fix: what does the technician check first?

A knowledge-base entry for two typical machine control support tickets, written from Makin's public
manuals, with a calibration-check calculator.

Page: https://bolgacg.github.io/field-fix/

- Ticket one: the bucket tip reads off grade. Ticket two: the GNSS position goes float or is lost.
- Each check is ordered from cheapest to most expensive, says what its result means, and cites the
  page of Makin's manual it comes from. Anything that is general practice and not Makin's procedure
  is marked on the page.
- The calculator follows the calibration check in the Excavator 3D user guide (pp. 172 to 173). The
  manual gives no number for the tolerance, so the page asks for one.
- `docs/guide-data.js` holds the steps; the page draws the triage, the step cards and every count
  from it.
- `tools/check_quotes.py` checks every quotation against the page of Makin's PDF that it cites.
  The PDFs are not in this repository. Download them from Makin's own page,
  https://www.makin3d.com/about/knowledge/knowledge-downloads/ , and run
  `python3 tools/check_quotes.py --dir <folder with the PDFs>`.

An independent work sample, not affiliated with Makin. Makin's manuals are Makin's: they are linked,
not copied, and quoted only in short passages with their page numbers.

Bolgaç Gülen, Odense, 2026.
