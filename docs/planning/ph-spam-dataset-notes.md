# Philippine spam SMS dataset: aggregate findings

Source: Kaggle "Philippine Spam SMS Messages" (bwandowando), file `SPAM_SMS.csv`, supplied by the product owner on October 10, 2026.
Licence, collection method and whether any text is personal data are **unverified**: Kaggle needs a login, so the page was not read.
The file is kept outside this repository. This note holds counts and themes only; no message text, number or sender is copied here.

## What the file is

- 1,021 rows, 945 unique after whitespace and case normalization. Sender numbers are masked and hashed. Dates run 2018 to July 2026.
- **Spam only.** There are no legitimate messages and no scam/spam distinction, so false alarms, precision and our four levels cannot be measured with it.
- About 38% contain two or more Tagalog function words, so roughly 6 in 10 are English and the rest Filipino or Taglish.
- Themes (overlapping): online-casino and betting promos about 52%, links about 29%, account and bank words about 17%, telco promos about 12%,
  prize or raffle about 10%, reward points or vouchers about 9%, jobs about 5%, loans about 3%.
- Link domains are dominated by betting sites on `.tv` (83 of the 300 or so domains with a common TLD), then `.com` and `.xyz`. Shorteners are under 1%.

## What our rules do with it (rules only, no embeddings, October 10, 2026, commit `175c9b8`)

| Result for 945 unique messages | Count |
| ------------------------------ | ----- |
| `not_sure`                     | 863   |
| `suspicious`                   | 75    |
| `likely_scam`                  | 5     |
| `probably_fine`                | 2     |

Only about 8.5% were flagged. Gambling promos (487) were 93% `not_sure`; reward points or vouchers (87) were 92% `not_sure`; loans (15) and jobs (44) were all `not_sure`.
Two spam messages received `probably_fine`, which is a false reassurance to look into.

## Why this is not training data

Project rule 7 forbids training, fine-tuning and dataset labeling. These counts are a read-only coverage probe. Counting frequent words or domains is not labeling,
but pointing a rule at this file and tuning until it passes would overfit and would raise false alarms, because the file contains official telco promotions that
look like spam but are legitimate. There is no legitimate class here to catch that.

## Safe uses

1. Mine themes and brand or phrase ideas by hand, then write generic rules in the three languages.
2. Split the file by a stable hash of the normalized text: half for reading and mining, half untouched as a recall check. Report recall on the untouched half as spam coverage, not scam accuracy.
3. Keep a separate guard set of legitimate messages (real OTP notices, bank safety warnings, delivery updates, genuine telco and shop promos, group chats).
   A new rule is accepted only if it adds zero false alarms on that guard set and on the existing development set.
4. Never commit rows, never copy a message verbatim into a test, archetype, keyword list or explanation, and never send rows to any service or model.
   Disclose in the submission table that a public spam dataset was used for hand-written reference data and a read-only coverage check.

## Product questions for the team

- Is an unsolicited online-casino promo a "suspicious" message for Sane, or out of scope? Half of this file is that.
- A reward-points-about-to-expire message with a link (a known PH scam pattern) was `not_sure` on the phone test; this is a clear gap either way.
