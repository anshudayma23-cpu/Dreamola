import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';

async function test() {
  const token = "KGAT_69cbbb2ddbb47fcf650d5e9aeaf71400";
  const url1 = "https://www.kaggle.com/api/v1/datasets/download/yuvrajsanghai/dream-dictionary";
  
  console.log("Fetching url1...");
  const res1 = await fetch(url1, { headers: { Authorization: `Bearer ${token}` } });
  const buf1 = Buffer.from(await res1.arrayBuffer());
  const zip1 = new AdmZip(buf1);
  const entry1 = zip1.getEntries().find(e => e.entryName.endsWith('.csv'));
  if (entry1) {
    const csv = zip1.readAsText(entry1);
    const records = parse(csv, { columns: false, skip_empty_lines: true });
    console.log("URL1 headers:", records[0]);
    console.log("URL1 row1:", records[1]);
  }

  const url2 = "https://www.kaggle.com/api/v1/datasets/download/manswad/dictionary-of-dreams";
  console.log("Fetching url2...");
  const res2 = await fetch(url2, { headers: { Authorization: `Bearer ${token}` } });
  const buf2 = Buffer.from(await res2.arrayBuffer());
  const zip2 = new AdmZip(buf2);
  const entry2 = zip2.getEntries().find(e => e.entryName.endsWith('.csv'));
  if (entry2) {
    const csv = zip2.readAsText(entry2);
    const records = parse(csv, { columns: false, skip_empty_lines: true });
    console.log("URL2 headers:", records[0]);
    console.log("URL2 row1:", records[1]);
  }
}
test();

test();
