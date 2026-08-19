import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';
import natural from 'natural';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { prisma } from '../src/lib/db';

async function downloadDataset(url: string, token: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const token = process.env.KAGGLE_API_TOKEN;
  if (!token) throw new Error("KAGGLE_API_TOKEN is not set in environment.");

  console.log("Downloading first dictionary...");
  const zipBuffer1 = await downloadDataset("https://www.kaggle.com/api/v1/datasets/download/yuvrajsanghai/dream-dictionary", token);
  
  console.log("Downloading second dictionary...");
  const zipBuffer2 = await downloadDataset("https://www.kaggle.com/api/v1/datasets/download/manswad/dictionary-of-dreams", token);

  const symbolMap = new Map<string, string>();

  // Parse zip 1
  console.log("Parsing first dictionary...");
  const zip1 = new AdmZip(zipBuffer1);
  const csvEntry1 = zip1.getEntries().find(e => e.entryName.endsWith('.csv'));
  if (csvEntry1) {
    const csvContent = zip1.readAsText(csvEntry1);
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    for (const record of records) {
      if (record.Word && record.Interpretation) {
        symbolMap.set(record.Word.trim().toLowerCase(), record.Interpretation.trim());
      }
    }
  }

  // Parse zip 2
  console.log("Parsing second dictionary...");
  const zip2 = new AdmZip(zipBuffer2);
  const csvEntry2 = zip2.getEntries().find(e => e.entryName.endsWith('.csv'));
  if (csvEntry2) {
    const csvContent = zip2.readAsText(csvEntry2);
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    for (const record of records) {
      if (record['Dream Symbol'] && record.Interpretation) {
        symbolMap.set(record['Dream Symbol'].trim().toLowerCase(), record.Interpretation.trim());
      }
    }
  }

  console.log(`Found ${symbolMap.size} unique symbols. Seeding database...`);

  // Clear existing symbols
  await prisma.symbol.deleteMany();

  // Stemmer setup
  const stemmer = natural.PorterStemmer;
  
  const entries = Array.from(symbolMap.entries()).map(([keyword, interpretation]) => {
    // Generate aliases using stemming
    const words = keyword.split(/\s+/);
    const aliases = [...new Set([keyword, ...words.map(w => stemmer.stem(w))])];
    
    return {
      keyword,
      aliases,
      interpretationTheme: interpretation,
      category: 'general'
    };
  });

  // Batch insert
  await prisma.symbol.createMany({
    data: entries,
    skipDuplicates: true
  });

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
