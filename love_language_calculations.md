# Love Language Assessment & Scoring Documentation

This document outlines how the Love Languages assessment is structured, how an individual's primary and secondary languages are identified, and how a couple's compatibility (clash score) is calculated in the AptaDuo conflict engine.

---

## 1. The Questions & Identification

The Love Language assessment is based on a forced-choice or frequency-counting model where users select statements that resonate with how they prefer to receive love. 

Each question in the assessment maps to one of the five Love Languages, represented by single-letter codes:
* **A** = Words of Affirmation
* **T** = Quality Time
* **G** = Receiving Gifts
* **S** = Acts of Service
* **P** = Physical Touch

### Example Questions (from the database)
* **A:** "I like to receive notes of affirmation." / "I feel loved when people affirm me."
* **T:** "I like to spend one-on-one time with a person who is special to me."
* **G:** "I like it when people give me gifts."
* **S:** "I feel loved when someone gives practical help to me."
* **P:** "I like to be hugged." / "I feel loved when people touch me."

### How Individual Languages Are Calculated
When a user submits their assessment, the `scoreLoveLanguages(responses)` function processes the data:

1. **Counting**: The function tallies how many times the user selected a statement corresponding to each of the five language codes.
2. **Ranking**: The language with the highest total count is designated as the user's **Primary** Love Language. The language with the second-highest count becomes their **Secondary** Love Language.
3. **Normalization**: Each language's count is also normalized to a 0–100 scale (based on a theoretical maximum count of 12) for visual representation on the frontend (like a bar chart).

---

## 2. Couple Compatibility (Clash Scoring)

When two users connect as a couple, the `scoreLoveLanguageClash(partnerA, partnerB)` function in the Conflict Engine compares their top two languages. 

Because Love Languages are fundamentally about translation and effort rather than deep-rooted personality instability, this section contributes **10%** to the couple's overall total conflict score. 

The engine evaluates their combination across a granular **6-tier system** to determine a base clash score out of 100:

| Tier | Combination Type | Condition | Base Clash Score |
| :--- | :--- | :--- | :--- |
| **1** | **Complete Match** | Both partners have the exact same Primary AND Secondary languages. | **5** |
| **2** | **Primary Match** | Both partners share the same Primary language, but their Secondaries differ. | **15** |
| **3** | **Perfect Swap** | Partner A's Primary is Partner B's Secondary, AND Partner A's Secondary is Partner B's Primary. | **30** |
| **4** | **Single Cross-Match** | Partner A's Primary matches Partner B's Secondary (or vice versa), but the other pair does not match. | **50** |
| **5** | **Secondary Match** | Both partners share the same Secondary language, but their Primaries differ. | **75** |
| **6** | **No Match** | There is zero overlap between either partner's top two languages. | **100** |

### Narrative Impact
Depending on the resulting score, the engine will generate specific relationship insights for the couple:
* **Scores 5 & 15:** Triggers a highly positive narrative, celebrating that the gestures that matter most to one partner are naturally the ones the other wants to give.
* **Scores 30, 50, & 75:** Triggers an "overlap" narrative, acknowledging that while they might have different top priorities, they already have a natural bridge to communicate love.
* **Score 100:** Triggers a "translation" narrative, gently explaining that the care they each give may not always land as intended, but that "the love is there — it just needs a bit of translation."
