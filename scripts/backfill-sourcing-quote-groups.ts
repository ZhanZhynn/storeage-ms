import { prisma } from "@/prisma/client";

async function main() {
  const allQuotes = await prisma.sourcingQuote.findMany({
    select: { id: true, caseId: true, quoteGroupId: true },
  });
  const groups = new Map<string, string>();
  for (const quote of allQuotes) {
    // A group equal to a quote ID is the marker written when revising legacy data.
    if (quote.quoteGroupId === quote.id) groups.set(quote.caseId, quote.quoteGroupId);
  }
  const quotes = allQuotes.filter((quote) => !quote.quoteGroupId);
  await Promise.all(
    quotes.map((quote) => {
      const quoteGroupId = groups.get(quote.caseId) || quote.id;
      groups.set(quote.caseId, quoteGroupId);
      return prisma.sourcingQuote.update({
        where: { id: quote.id },
        data: { quoteGroupId },
      });
    }),
  );
  console.log(`Backfilled ${quotes.length} sourcing quote groups.`);
}

main().finally(() => prisma.$disconnect());
