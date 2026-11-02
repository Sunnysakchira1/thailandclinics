# Supporting pages verification log (Oct 2026)

Healthcare gate log for the supporting pages in docs/seo/supporting-pages-brief-2026-10.md. Each section is appended by the agent that verified it.

## Fertility pages

Verified 31 Oct–1 Nov 2026. Note on primary sources: the official Thai hosts for the Act and Medical Council notices (mrd.hss.moph.go.th, media.thaigov.go.th, ratchakitcha) timed out or failed DNS from our location every time we tried, through both a direct fetch and a browser fetch. So the legal claims below rest on reputable secondary sources (a Thai law publisher, a peer-reviewed article, major outlets). We softened the wording wherever only one secondary source supports a claim. Prices come from clinic pages fetched live on 31 Oct 2026, or from the brief's already-verified site figures.

Skills: sounds-human-cft, content-fact-verifier-cft, ai-claims-guard-cft and self-audit-qa-gate-cft were NOT invoked through the Skill tool, to stay inside the 25-minute time budget. We did each check by hand instead: a banned-word and AI-tell scan against content/TONE.md, claim-by-claim source checks (this log), a scan for outcome promises, "best" and success rates, and a structure, length and link check. The QA verdict for each page is below.

### ivf-age-limit-thailand (new)

| Claim | Source / action |
|---|---|
| No published legal maximum age for IVF; the ART Act sets who, not age | No age limit appears in any summary we checked: https://www.thailawonline.com/surrogacy-in-thailand-comprehensive-analysis/ · https://pmc.ncbi.nlm.nih.gov/articles/PMC5753847 · Bangkok Hospital fertility FAQ, which mentions no age limit at all: https://www.bangkokhospital.com/en/bangkok/content/fertility-questions-answered. SOFTENED to "we found no published legal maximum", plus a note that the official notices couldn't be opened; the page tells readers to confirm |
| IVF limited to legally married couples | PMC5753847 (above); RTCOG/clinic practice already used on the earlier pages; SAFE Fertility requires a translated, certified marriage certificate (via search summary). Consistent across sources |
| Surrogate (non-relative) must be 20–40 | thailawonline (above), citing the Ministry criteria. Attributed as "legal summaries say" |
| Surrogacy limited to married couples with at least one Thai spouse (3+ years if mixed) | thailawonline s.21(1); PMC5753847 |
| GFC LiTE ≤35, Gold ≤37, AMH ≥1.2; over-37 packages ฿230,000/฿350,000; PGT-A ฿39,900 / ฿15,900 | Brief's verified figures plus content/blog/best-ivf-hospitals-bangkok.mdx and ivf-cost-thailand.mdx (GFC package page verified Oct 2026; the en/ivf-icsi-package URL returned 404 on 1 Nov, so we didn't re-fetch it) |
| Bangkok Hospital ฿456,000 PGT package aimed at women >35 / after miscarriage | Verified site figure in best-ivf-hospitals-bangkok.mdx |
| Bangkok Hospital: egg numbers fall from 37 | https://www.bangkokhospital.com/en/bangkok/content/fertility-questions-answered ("in women 37 and older… less eggs being produced") |
| MedPark: 8–10 eggs per pregnancy if under 35 | https://medparkhospital.com/en-US/online-store/egg-freezing-package |
| Nakornthon: freeze before 35, use before 40–45 | https://en.nakornthon.com/article/detail/egg-freezing |
| GFC: ideal egg-freezing window 20–35, still possible after 35 / 40 | https://www.genesisfertility.co.th/en/egg-freezing |
| Embryo testing allowed for women ≥35 with a medical reason | Medical Council Notice 95(5)/2558, as summarised in the gender-selection draft. Official PDF unreachable (https://mrd.hss.moph.go.th/mrd1_hss/wp-content/uploads/2022/09/12-ประกาศแพทยสภา-ที่-95-5-2558.pdf), so this is UNVERIFIED this session and kept with "under the Medical Council's rules" attribution. Flagged for a check from a Thai IP |
| Egg donation legal, commercial donation / sale of eggs banned | https://www.asianews.it/en/south-east-asia/thailand/law-banning-commercial-surrogacy-takes-effect ("prohibits commercial surrogacy and the trade of sperm and eggs") |
| "Some clinics treat women into their 40s" | Directory listings only (ovu.com), which is weak, so SOFTENED to "possibly / some clinics", with no clinic named and no number |
| No success-rate figures | Removed by design; we say no provider publishes audited age-adjusted rates (consistent with best-ivf-hospitals-bangkok.mdx) |

**QA verdict: SHIP (with the flag above).** Answer first; money page linked twice; 2 internal posts; no banned words; British English; title 57 chars, description 155 chars; no outcome promises.

## Physiotherapy pages

Verified 31 Oct – 1 Nov 2026 by the physio checker agent. Sources fetched live on these dates unless marked otherwise. Skills applied: sounds-human-cft, content-fact-verifier-cft, ai-claims-guard-cft, self-audit-qa-gate-cft (loaded via Skill tool; checks run per page). Orchestrator not re-run: the parent session already scoped this task.

Shared sources used on several pages:
- **[WP]** World Physiotherapy, Thailand member profile (2024 data): https://world.physio/membership/thailand. Quotes: direct access permitted = yes; "Can people self refer to physiotherapists in private practice?" yes; "...in the public system?" yes; "the Physical threrapy licence is granted by Physical Therapy Council by national examination."
- **[ACT]** Physical Therapy Profession Act B.E. 2547 (2004) created the Physical Therapy Council and licenses physiotherapists. Secondary only: https://en.wikipedia.org/wiki/List_of_professional_associations_and_regulatory_councils_in_Thailand plus [WP]. The Council site (pt.or.th) returned 403. The statutory definition ("evaluation, diagnosis") could NOT be retrieved from a primary source, so every quote of it was removed.
- **[ALZ]** Allianz Care Flexicare Individual Benefit Guide, "Valid from 1st June 2026", p.40: https://allianzcare.com/content/dam/onemarketing/azcare/allianzcare/en/docs/DOC-IBG-Flexicare-en-UK-0526.pdf. Quotes: "Prescribed physiotherapy: Treatment provided by a registered physiotherapist following referral by a doctor." / "initially restricted to 12 sessions per condition, after which treatment must be reviewed by your therapist or the doctor who referred you." / "Physiotherapy does not include therapies such as Rolfing, massage, Pilates, Fango and Milta."
- **[FORM]** https://formrecovery.com/prices/ (fetched 1 Nov 2026): consultation 30 min 1,000; physio 60/90/120 min 2,100/2,900/3,500; aqua therapy 60 min 2,100; "Prepaid packages of 4 to 40 sessions"; credits "valid for 12 months from the date of purchase"; "All payments are final and non-refundable". Locations menu: Asoke (Soi 20), Thonglor (Soi 49), Phrom Phong (Soi 24), Four Seasons Hotel Bangkok. Form is a Locully client: neutral wording only, no internal booking/revenue figures used.
- **[BPC]** https://www.bpcphysio.com/prices/ (fetched 1 Nov 2026): consultation 30 min ฿700; treatment 60/90/120 min ฿2,000/2,900/3,800; VALD Testing ฿1,000; ACL Rehab Course ฿3,300 ("First Assessment Only. Prices for 105 minute sessions"). Branches: Sukhumvit 39, Sathorn, Sanampao.
- **[PA]** Pain Away Clinic price list images, uploaded Sept 2026, linked from https://www.painawayclinic.com/en/home/ (e.g. https://www.painawayclinic.com/wp-content/uploads/2026/09/pain-away-clinic-price-2026-1.jpg to -5.jpg): initial consultation ฿500; "For the initial visit, a consultation is required before any treatment can be provided"; manual treatment 30/45/60/75/90 min = ฿1,290/1,690/2,090/2,590/3,090. NO "฿600 doctor's fee for insurance claims" appears on the current list (฿600 is the revisit consultation fee). The older site figure "฿1,500–3,000" is superseded.
- **[HOSP]** "None of the six hospitals publishes a physio price" and hospital equipment: carried from the verified cluster page /blog/physiotherapy-hospitals-vs-clinics-bangkok/ (14 Oct 2026). Bumrungrad re-checked: https://www.bumrungrad.com/en/centers/rehabilitation-physical-therapy-center-bangkok-thailand: "Our diagnosis and individualized treatment procedures are carried out by our team of rehabilitative medicine specialists"; no prices.
- **[NHS]** https://www.nhs.uk/conditions/sprains-and-strains/: "try to avoid heat ... alcohol and massages for the first couple of days"; A&E if you heard a crack, the part changed shape, numbness/tingling, skin blue/grey or cold; 111 if you cannot put weight on it, pain/swelling worse, high temperature.
- **[AAOS]** https://www.orthoinfo.org/en/treatment/acl-injury-does-it-require-surgery/: "Most patients are allowed to return to full sports participation within 6 to 12 months, depending on the patient's progress, strength, and mechanics"; criteria include strength, endurance, function, balance and control fully restored.
- **[KAM]** https://kamalaya.com/structural-revival-wellness-program/ (fetched 1 Nov 2026): 5/8/11/15 nights; recommended for posture, desk-sitters, "Rehabilitation after injury or surgery"; 8 nights THB 105,568 "PACKAGE PRICE (THB) (EXCLUDING ACCOMMODATION)"; "These rates are valid until 31 March 2027 only"; "TOTAL TREATMENTS 13" for 8 nights. Treatments labelled with a physiotherapist in the 8-night column: Physiotherapy Session with 3D Full Body Scan, Revival Exercise with Physiotherapist, Myofascial Release Therapy with Physiotherapist, Aqua Fitness with Physiotherapist = 4. Note: Kamalaya's own table shows 15 line items marked "1" for 8 nights against a stated total of 13, so "4 of 13" uses Kamalaya's stated total.

### physiotherapy-cost-thailand
| Claim | Source / action |
|---|---|
| 60 min ฿2,000 (BPC), ฿2,090 (Pain Away), ฿2,100 (Form); consults ฿700 / ฿500 / ฿1,000 | [BPC], [PA], [FORM]. Opener, description and FAQ rewritten from the old "฿1,500–3,000" to these live figures |
| Form 90/120 min ฿2,900/3,500; BPC ฿2,900/3,800; Pain Away 90 min ฿3,090 | [FORM], [BPC], [PA] |
| Pain Away "฿600 doctor's fee for insurance claims" | REMOVED: not on the current price list [PA] |
| Pain Away "consultation required before first treatment" | [PA], added |
| BPC ACL assessment ฿3,300 (105 min), VALD ฿1,000; Form aqua ฿2,100 | [BPC], [FORM] |
| Course maths (consult + 4/8/12 × 60 min) | Arithmetic re-checked against [FORM]/[BPC]: 9,400/17,800/26,200 and 8,700/16,700/24,700 |
| Form packages 4–40 sessions, 12-month credit expiry, non-refundable | [FORM] |
| Six hospitals don't publish physio prices; Bumrungrad specialists diagnose and plan | [HOSP] |
| Kamalaya ฿105,568, 8 nights, excl. accommodation; 4 of 13 treatments with a physio | [KAM] |
| Allianz Flexicare: referral definition, 12 sessions, no massage/Pilates | [ALZ]. Wording tightened to "its prescribed physiotherapy" and "says physiotherapy doesn't include massage or Pilates" |
| Physios must be licensed by the Physical Therapy Council | [WP], [ACT] |
| Prices outside Bangkok | Not stated: page says we haven't verified them |

Frontmatter: title 55 chars, description 147 chars, type cluster, dates 2026-10-31. Money page linked twice (early + closing). FAQ uses ###. British English. No em dashes, no banned words.
**QA verdict: SHIP.** The figures now come from price pages fetched today. Review date for prices: 31 Jan 2027.

### egg-freezing-cost-thailand (new)

| Claim | Source / action |
|---|---|
| Nakornthon ฿169,000: stimulation up to 2,400 units, scans, retrieval, first 10 eggs, 1-year storage; listed for foreigners living in Thailand | https://en.nakornthon.com/article/detail/egg-freezing (fetched 31 Oct 2026; one search snippet said ฿190,000, but the live page says ฿169,000, so we used the page). Also used for "before 35" and "15–20 eggs per pregnancy" |
| GFC from ฿170,000, up to 20 eggs, first year of storage; suits single women; ideal age 20–35; about 2 weeks per cycle | https://www.genesisfertility.co.th/en/egg-freezing |
| MedPark ฿180,000 (1 yr) / ฿219,000 (3 yr), unlimited eggs, excludes medication, Thai nationals/residents only; 8–10 eggs if under 35 | https://medparkhospital.com/en-US/online-store/egg-freezing-package (a search snippet said ฿160,000, but the live page says ฿180,000/฿219,000, so we used the page) |
| Bangkok Hospital ฿138,000 + ฿126,500 = ฿264,500; storage ฿1,300/vial/yr; fly-in only; valid to 31 Dec 2026 | https://www.bangkokhospital.com/en/bangkok/package/egg-freezing |
| Range ฿120,000–265,000 | Lower bound = pillar guide range (brief, verified site figure ฿120,000–200,000); upper bound = Bangkok Hospital total above |
| Storage ฿10,000–30,000/yr at other clinics | Brief's pillar figure; worded as "typically" |
| IVF limited to legally married couples, so using the eggs requires marriage | PMC5753847; earlier pages' RTCOG/clinic sources |
| Current law bans exporting eggs; 2026 draft would allow it with committee approval; consultation 2–31 Jul 2026; not yet law | https://www.thestar.com.my/aseanplus/aseanplus-news/2026/07/20/thailand-begins-public-consultation-on-revised-surrogacy-bill (draft + export); https://www.thailawonline.com/glossary/surrogacy/ (not enacted as of Sept 2026). The export ban under the current Act rests on the earlier draft's research plus the draft's export proposal (no reason to propose it unless it's currently banned). The official Act text was unreachable, so this is SOFTENED to "the current law also bans exporting eggs" and readers are told to confirm with the clinic |
| No success-rate claims | None made |

**QA verdict: SHIP.** Answer first with a ฿ range; costs table; the MedPark "excludes medication" caveat is surfaced; money page linked twice (the closing anchor "Compare egg freezing and IVF clinics in Bangkok"); 2 internal posts; no banned words.

### physio-vs-thai-massage
| Claim | Source / action |
|---|---|
| Physios licensed by the Physical Therapy Council under the 2004 Act; licence by national exam | [WP], [ACT]. Act name corrected to "Physical Therapy Profession Act B.E. 2547 (2004)" |
| Health massage regulated under the Health Establishment Act B.E. 2559 (2016); providers hold an accredited certificate and register with the Department of Health Service Support | https://thaidj.org/index.php/JHS/article/view/8812 (peer-reviewed study: spa, health massage, beauty massage need permission; 87,667 service providers registered; 539 curricula accredited) + https://unionspace.co.th/thailand-license-permit/spa-massage-license.php (HSS issues licences; Section 23 provider must hold a DHSS-accredited certificate). No Royal Gazette text retrieved: kept because two sources agree and the wording is general |
| Medical Thai massage is Thai traditional medicine, licensed by the Thai Traditional Medical Council under the Thai Traditional Medical Professions Act B.E. 2556 (2013) | Department of Thai Traditional and Alternative Medicine, BIMSTEC Traditional Medicine Systems 2023 report: https://tpd.dtam.moph.go.th/wp-content/uploads/e-book/EB-BIMSTEC-2023/files/basic-html/page111.html (TTMC "registers and issues licences for TTM practitioners ... under Thai Traditional Medical Profession Act B.E. 2556") |
| NCCIH: weak evidence for low-back pain; short-term benefit only for shoulder pain; rare serious side effects (blood clot, nerve injury, fracture), linked to vigorous/deep tissue massage or elderly people | https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know (quotes: "only weak evidence that it may be helpful"; "short-term benefits only"; "rare reports of serious side effects, such as a blood clot, nerve injury, or bone fracture") |
| NHS: avoid massage for the first couple of days after a sprain/strain; fracture signs | [NHS]. Fracture bullet corrected: "can't put weight on it" is an NHS 111/urgent-advice sign, not an A&E sign, so it now says "see a doctor first" |
| 2020 BMC Pregnancy and Childbirth case: pregnant Thai woman, massive pulmonary embolism after leg massage at a traditional massage shop | https://pmc.ncbi.nlm.nih.gov/articles/PMC7178622/ (Sutham et al., Apr 2020). Restatement fixed: authors say leg massage in DVT "can dislodge thrombi", and traditional massage in pregnancy "should be contraindicated unless they are proven to have no such risk" |
| 2015 Ancient Science of Life: rough technique risks fracture; carotid-area massage risks embolism | https://pmc.ncbi.nlm.nih.gov/articles/PMC4728864/ ("Thai traditional massage: Issues causing possible adverse effects") |
| Allianz excludes massage from physio cover | [ALZ] |
| Form offers Applied Thai Medicine alongside physio and TCM | [FORM] (service menu: "Applied Thai Traditional Medicine"). Neutral mention, no endorsement |

Frontmatter: title 54, description 148, cluster, 2026-10-31. Money page 2× (early + closing). FAQ ###. Opener softened from "can ease muscle pain" to "may ease muscle aches" to match NCCIH.
**QA verdict: SHIP.**

### sports-injury-clinic-bangkok
| Claim | Source / action |
|---|---|
| BPC 60 min ฿2,000, consult ฿700, ACL course ฿3,300 (105 min), VALD ฿1,000; branches Sukhumvit 39, Sathorn, Sanam Pao | [BPC] |
| Form 60 min ฿2,100, consult ฿1,000; branches Asoke, Thonglor, Phrom Phong | [FORM] |
| Form "Asoke branch has a rehabilitation and exercise area" | REPLACED with "each branch has gym space" (verified cluster page, 14 Oct 2026) |
| Form six-phase ACL programme, advanced by milestones not dates | https://formrecovery.com/pain/post-op-rehab/acl-surgery/ ("ACL rehabilitation has six distinct phases, each with specific goals and measurable milestones. We don't advance you to the next phase on a calendar date") |
| BPC reviewer caveats; Unique Care Station focus and reviews | ThailandClinics directory/review data, as used on the verified cluster page. Unique Care Station prices stated as unverified on the page |
| Samitivej Sports and Orthopedic Center: Building 1, 1st floor; orthopaedic surgeons, physical therapists, sports injury and rehab specialists; isokinetic, balance system, VO2 max; ACL, meniscus, rotator cuff, ankle sprains; no prices | https://www.samitivejhospitals.com/center/detail/sports-and-orthopedic-center |
| BASEM: 5th floor, Building D, Bangkok Hospital; treats bone, joint, muscle, tendon, ligament, meniscus and cartilage injuries, incl. arthroscopic surgery | https://www.bangkokhospital.com/en/bangkok/center-clinic/bone-joint/bangkok-academy-of-sports-and-exercise-medicine-basem/treatmentsandservices and the BASEM overview page (location via Bangkok Hospital's indexed page; page is JS-rendered) |
| BASEM "open daily 08:00–16:00" and "surgery packages are time-limited offers" | REMOVED: hours seen only in a search snippet; package claim not found. Replaced with "doctor-led, doesn't publish physio prices, ask for an itemised quote" |
| NHS A&E and urgent-advice signs | [NHS] |
| AAOS: most return to full sport within 6–12 months after ACL reconstruction | [AAOS] |
| FAQ: "Thai law lets physios assess and diagnose" | REMOVED: statutory definition not retrieved from a primary source. Replaced with [WP] self-referral (private and public) |
| Physios licensed by the Physical Therapy Council | [WP], [ACT] |

Frontmatter: title 59, description 151, city bangkok, cluster, 2026-10-31. Money page 2×. FAQ ###. The editorial order is labelled as editorial, not an outcome ranking. No "best" claims.
**QA verdict: SHIP.**

### physio-rehab-retreat-thailand
| Claim | Source / action |
|---|---|
| Kamalaya Structural Revival: 5/8/11/15 nights; for desk-sitters and rehab after injury or surgery; 8 nights ฿105,568 excl. accommodation; valid to 31 Mar 2027; 13 treatments, 4 with a physiotherapist; includes Pilates, osteopath, Thai therapeutic treatment, massage, hyperbaric oxygen | [KAM]. Tense changed from "charged" to "charges", since the rate runs to March 2027. Kamalaya's own table inconsistency is noted under [KAM] |
| Amanpuri Performance and Recovery: "physiotherapy-based"; 3-day sample starts with "Physical assessment with physiotherapist and/or wellness consultation with doctor"; massage, training, hydrotherapy, acupuncture; no published price | https://www.aman.com/resorts/amanpuri/wellness/performance-recovery |
| STAY: programmes "pain-free", "reboot, rehab and recovery", post-op, return to play, posture, aqua therapy | REMOVED: not found on any page we could retrieve (staywellbeing.com subpages 404) |
| STAY WELL Clinic and Physio exists at the Rawai resort and covers physiotherapy, cryotherapy, anti-ageing and longevity medicine | https://www.phuket101.net/stay-wellbeing-lifestyle-resort/ (updated 18 Apr 2026), corroborated by the PlacidWay listing https://www.placidway.com/view-review/324518/Stay-Well-Clinic-Physio (56/80 Moo 4 Rawai). Secondary sources only, so the page says we couldn't find programme details or prices on the resort's site |
| Clinic comparison: 8 × 60 min + consult = ฿16,700 (BPC) / ฿17,800 (Form) | [BPC], [FORM], arithmetic checked |
| AAOS 6–12 months return to sport | [AAOS] |
| Allianz: referral for the prescribed physio benefit; excludes massage and Pilates | [ALZ] |
| Hope Rehab in Si Racha treats addiction | https://en.wikipedia.org/wiki/Hope_Rehab_Centre (drug and alcohol residential rehab, Si Racha, Chonburi). Official site returned a Cloudflare block |
| Physio licensed by the Physical Therapy Council | [WP], [ACT] |
| Endorsement check | Page states "We haven't visited these retreats, and listing them isn't an endorsement." No ranking or "best" language |

Frontmatter: title 61, description 152, cluster, 2026-10-31. Money page 2×. FAQ ###.
**QA verdict: SHIP.** Watch item: re-check Kamalaya's rate after 31 Mar 2027.

### ivf-cost-thailand (earlier draft, gate applied)

| Claim | Source / action |
|---|---|
| GFC ฿150,000–350,000 (4 ICSI packages), LiTE ≤35 / Gold ≤37, AMH ≥1.2, over-37 ฿230,000/฿350,000, PGT-A ฿39,900/฿15,900, med cap 2,400–4,000 IU, FET ฿40,000 | Brief's verified figures + best-ivf-hospitals-bangkok.mdx (verified Oct 2026). Not re-fetched: the GFC package URL 404'd on 1 Nov |
| "and at least 6 eggs retrieved" (LiTE condition) | Not in the brief and not re-verifiable, so REMOVED |
| MedPark ฿280,000 residents only; Prime ฿299,000 valid to 31 Dec 2026; Bangkok Hospital ฿335,000 / ฿456,000, fly-in, valid to 31 Dec 2026, PGT-A+freeze ฿96,000 | Brief + best-ivf-hospitals-bangkok.mdx |
| Bangkok Hospital Package A ฿138,000 = 10 days of medication, 3 scans, 3 doctor visits | Re-verified live: https://www.bangkokhospital.com/en/bangkok/package/egg-freezing (the same Package A is listed there) |
| Medication +฿60,000–150,000; IVF ฿250,000–450,000 | Brief pillar ranges |
| IVF limited to legally married couples; foreign married couples can be treated; foreign certificate needs translation/legalisation | https://pmc.ncbi.nlm.nih.gov/articles/PMC5753847 (married couples); the SAFE Fertility certificate requirement comes from a search summary of https://www.thailandstarterkit.com/partner/safe-fertility-center/ (secondary). Kept |
| "Same-sex married couples… can't have IVF yet" | SOFTENED to "clinics generally aren't treating married same-sex couples yet", with the ART Act "husband and wife" wording explained and readers told to ask the clinic. Sources: https://www.thailawonline.com/glossary/surrogacy/ (s.67 of the Marriage Equality Act doesn't carry across husband/wife provisions); the mali.me post title "Thai law does not permit IVF or IUI for same-sex married couples" (page returned 403). One secondary summary says practice varies, which is why we softened |
| Draft amendment, consultation July 2026, "spouses", not law | https://www.thestar.com.my/aseanplus/aseanplus-news/2026/07/20/thailand-begins-public-consultation-on-revised-surrogacy-bill · thailawonline (not enacted as of Sept 2026) |
| Bangkok Hospital tells fly-in patients to plan 3–4 weeks | Carried from the earlier draft; NOT re-verified this session. Flag: re-check on Bangkok Hospital's IVF package page before publishing |

**QA verdict: SHIP after fixes** (pending the 3–4 week re-check). Answer first; table; no outcome promises; 2 money-page links + 2 internal posts.

### ivf-gender-selection-thailand (earlier draft, gate applied)

| Claim | Source / action |
|---|---|
| Non-medical sex selection is prohibited under the ART Act framework | https://pmc.ncbi.nlm.nih.gov/articles/PMC5753847 ("prohibition of sex selection"); several secondary sources say sex selection is allowed only for medical reasons such as a serious sex-linked condition |
| Notice No. 95(5)/2558 exists, on genetic diagnosis of embryos | The notice title is confirmed by the DHSS-hosted file name and a search summary: https://mrd.hss.moph.go.th/mrd1_hss/wp-content/uploads/2022/09/12-ประกาศแพทยสภา-ที่-95-5-2558.pdf (server unreachable for the full text) |
| "Published in the Royal Gazette on 4 November 2015" | Couldn't verify, so REMOVED |
| "Amended in 2021, published Feb 2022" | Couldn't verify, so SOFTENED to "the notice has since been amended; confirm wording" |
| List of 6 permitted PGT indications | Couldn't verify against the primary text, so SOFTENED to "as summarised in published accounts… ask your clinic for the current list" |
| Clinic must report every test to DHSS yearly | Couldn't verify, so REMOVED |
| "Prime Fertility Center and SAFE Fertility say plainly non-medical selection isn't allowed" | REMOVED. A medical-tourism listing (bookimed) claims Prime offers sex selection, and we couldn't confirm either clinic's own statement. Replaced with a general caution about older articles and listings |
| 2026 draft contents (spouses, foreign couples, export with committee approval, penalties up to 10 yrs / ฿2m) | https://www.thestar.com.my/aseanplus/aseanplus-news/2026/07/20/thailand-begins-public-consultation-on-revised-surrogacy-bill. Summaries don't mention sex selection, so the claim "not as far as we can see" stands |

**QA verdict: SHIP after fixes, flag: the PGT indication list needs a check against the official notice from a Thai IP before or soon after publishing.**

### ivf-single-women-thailand (earlier draft, gate applied)

| Claim | Source / action |
|---|---|
| Single women can't have IVF; limited to legally married couples | PMC5753847; thailawonline; consistent with the pillar guide |
| RTCOG 2023 practice guideline wording (IVF/ICSI/GIFT/ZIFT; Thai registration or embassy document) | No URL found this session, so REPLACED with the Act's husband/wife wording, legal summaries, and SAFE Fertility's translated-certificate requirement |
| Medical Council donor-insemination consent rule | Primary text unreachable, so SOFTENED to "donor insemination is still assisted reproduction under the Act, so it needs a married couple" |
| Marriage Equality Act in force 23 Jan 2025; ART Act still "husband and wife"; s.67 doesn't carry across | https://www.thailawonline.com/glossary/surrogacy/ |
| Draft "spouses"; consultation 2–31 Jul 2026; not law; still has to go to Cabinet | The Star (above); thailawonline (Sept 2026: "must still go to the Cabinet and through the legislature"). "Published in the Royal Gazette" phrasing removed |
| Medical Council 2015 egg-storage rules list two reasons | Couldn't verify, so SOFTENED to "formal rules were written with married couples and medical reasons in mind" |
| Superior A.R.T. offers egg freezing to women without a partner | Couldn't verify, so REMOVED; kept GFC (verified: https://www.genesisfertility.co.th/en/egg-freezing) |
| Export of eggs banned | SOFTENED in the table to "No, under current rules"; the draft would allow it with approval (The Star). The bullet and FAQ wording "under the current law" were kept |
| Surrogacy limited to married couples with at least one Thai spouse | thailawonline, s.21(1) |

**QA verdict: SHIP after fixes.**

### Not verified this session (open items)
1. The full text of the Medical Council notices 95(2)/2558 and 95(5)/2558, and the ART Act itself. The Thai government hosts were unreachable, so check them from a Thai connection: the age-limit position, the PGT indication list, and the export ban wording.
2. Bangkok Hospital's "3–4 weeks in Thailand" claim (ivf-cost-thailand).
3. GFC IVF package page (404 at the old URL); figures rely on the Oct 2026 verification.
4. Whether any Bangkok clinic publishes its own upper age limit for IVF with own eggs. None found on clinic pages, only in directory listings.

### physiotherapy-referral-thailand
| Claim | Source / action |
|---|---|
| No referral needed: direct access permitted; self-referral in private practice and in the public system | [WP] (primary for the profession's international body; 2024 data). This answers the target query |
| Physios licensed by the Physical Therapy Council under the Physical Therapy Profession Act B.E. 2547 (2004); licence by national exam | [WP], [ACT]. Act name corrected |
| "The Act defines physical therapy practice as including 'evaluation, diagnosis'... and doesn't make a referral a condition" | REMOVED: Act text not retrieved from a primary source (Council site 403, Krisdika not reached). Replaced with the [WP] direct-access statement |
| "The law doesn't require a referral" / "Not by law" | DOWNGRADED to "Thailand doesn't require a referral" / "Not as a rule", resting on [WP] rather than a statute we could not read |
| Bumrungrad: rehab medicine specialists carry out diagnosis and treatment plans | [HOSP] Bumrungrad page, quoted above |
| First-visit prices ฿500 (Pain Away), ฿700 (BPC), ฿1,000 (Form) | [PA], [BPC], [FORM] |
| Pain Away "฿600 doctor's fee for insurance claims" | REMOVED (not on the current list). Replaced with the listed "Initial Consultation Fee with Medical Certificate" ฿1,100 vs ฿500 [PA] |
| Allianz Flexicare referral definition and 12-session review | [ALZ] |
| NHS signs to see a doctor first | [NHS] |
| Travel insurance checklist | General guidance, no factual claim about a named insurer |

Frontmatter: title 53, description 152, cluster, 2026-10-31. Money page 2× (early + closing). FAQ ###.
**QA verdict: SHIP.**

### Physio cross-page notes
- The canonical pages /blog/physiotherapy-hospitals-vs-clinics-bangkok/ and /blog/physiotherapy-bangkok-guide/ still state Pain Away "฿1,500–3,000" and a "฿600 doctor's fee for insurance claims". The current Pain Away price list (Sept 2026) doesn't support either. Those pages were out of scope and have NOT been edited. Flagged for update.
- Could not verify from a primary source: the text of the Physical Therapy Profession Act B.E. 2547 (no claim on these pages now depends on it), BASEM opening hours, STAY's programme list, and Kamalaya's internal treatment count (its table lists 15 items against a stated 13).

### Physio QA gate summary (self-audit-qa-gate-cft, benchmark: /blog/physiotherapy-hospitals-vs-clinics-bangkok/)
| Page | Voice | Guardrails | Expertise | Format | Completeness | Expert test | Verdict |
|---|---|---|---|---|---|---|---|
| physiotherapy-cost-thailand | PASS | PASS | PASS | PASS | PASS | PASS | SHIP |
| physio-vs-thai-massage | PASS | PASS | PASS | WARN (~1,140 words incl. markup, brief max 1,100) | PASS | PASS | SHIP |
| sports-injury-clinic-bangkok | PASS | PASS | PASS | WARN (~1,135 words incl. markup) | PASS | PASS | SHIP |
| physio-rehab-retreat-thailand | PASS | PASS | PASS | PASS | PASS | PASS | SHIP |
| physiotherapy-referral-thailand | PASS | PASS | PASS | PASS | PASS | PASS | SHIP |

sounds-human-cft: zero em dashes, zero tier-1 AI vocabulary, no TONE.md banned words. En dashes appear only in numeric ranges, as TONE.md requires. ai-claims-guard-cft: no guarantees, no outcome promises, no "best" superlatives. "Best for" appears only as a use-case label in a table. The retreat-vs-clinic comparison is backed by the published-price table. Gate 4 (social hook) is N/A.
