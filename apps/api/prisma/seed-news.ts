/**
 * Fills the site with a realistic bilingual newsroom: categories, districts,
 * tags and a spread of articles across every workflow status, each with an
 * audit trail. Idempotent — re-running updates the same slugs.
 *
 *   npm run prisma:seed:news   (from apps/api)
 */
import { ArticleStatus, PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const IMAGE = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600_000);

type Seed = {
  slug: string;
  category: [string, string];
  district?: string;
  image: string;
  tags: string[];
  status: ArticleStatus;
  hours: number;
  breaking?: boolean;
  featured?: boolean;
  readingMinutes?: number;
  en: { title: string; subtitle: string; body: string };
  kn: { title: string; subtitle: string; body: string };
};

const CATEGORIES: Record<string, string> = {
  karnataka: "Karnataka",
  bengaluru: "Bengaluru",
  india: "India",
  business: "Business",
  technology: "Technology",
  sports: "Sports",
  agriculture: "Agriculture",
  entertainment: "Entertainment",
  politics: "Politics",
  health: "Health",
  education: "Education",
  districts: "Districts"
};

const DISTRICTS: [string, string, string][] = [
  ["bengaluru-urban", "Bengaluru Urban", "ಬೆಂಗಳೂರು ನಗರ"],
  ["dakshina-kannada", "Dakshina Kannada", "ದಕ್ಷಿಣ ಕನ್ನಡ"],
  ["udupi", "Udupi", "ಉಡುಪಿ"],
  ["mysuru", "Mysuru", "ಮೈಸೂರು"],
  ["shivamogga", "Shivamogga", "ಶಿವಮೊಗ್ಗ"],
  ["tumakuru", "Tumakuru", "ತುಮಕೂರು"],
  ["belagavi", "Belagavi", "ಬೆಳಗಾವಿ"],
  ["kodagu", "Kodagu", "ಕೊಡಗು"]
];

const ARTICLES: Seed[] = [
  {
    slug: "state-budget-irrigation-rural-roads",
    category: ["karnataka", CATEGORIES.karnataka],
    district: "bengaluru-urban",
    image: IMAGE("photo-1582510003544-4d00b7f74220"),
    tags: ["Budget", "Irrigation", "Rural Development"],
    status: ArticleStatus.PUBLISHED,
    hours: 2,
    featured: true,
    readingMinutes: 6,
    en: {
      title: "State budget puts irrigation and rural roads at the centre of spending",
      subtitle: "Officials say the allocation pattern favours districts that reported the sharpest rainfall deficit last year.",
      body: `The state budget presented this week places irrigation, rural connectivity and drinking water at the centre of capital spending for the coming financial year, with a significant share of the outlay directed towards districts that recorded the sharpest rainfall deficit last season.

Departmental notes accompanying the budget indicate that lift irrigation schemes, canal modernisation and tank rejuvenation will absorb the largest single block of the allocation. A second tranche is earmarked for upgrading rural roads that connect farm-gate markets to state highways, a long-standing demand from grower associations in the interior districts.

Officials in the finance department said the emphasis this year is on completing projects already under way rather than announcing new ones, and that releases will be tied to physical progress reported by implementing agencies. Spending on urban infrastructure, by contrast, remains close to last year's level.

Economists tracking state finances point out that the revenue picture will depend heavily on collections in the second half of the year. The budget assumes a moderate growth in tax revenue and holds the fiscal deficit within the limit prescribed by the state's fiscal responsibility legislation.`
    },
    kn: {
      title: "ರಾಜ್ಯ ಬಜೆಟ್‌ನಲ್ಲಿ ನೀರಾವರಿ ಮತ್ತು ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳಿಗೆ ಆದ್ಯತೆ",
      subtitle: "ಕಳೆದ ವರ್ಷ ಅತಿ ಹೆಚ್ಚು ಮಳೆ ಕೊರತೆ ಕಂಡ ಜಿಲ್ಲೆಗಳಿಗೆ ಹೆಚ್ಚಿನ ಅನುದಾನ ಎಂದು ಅಧಿಕಾರಿಗಳ ಮಾಹಿತಿ.",
      body: `ಈ ವಾರ ಮಂಡನೆಯಾದ ರಾಜ್ಯ ಬಜೆಟ್‌ನಲ್ಲಿ ಮುಂದಿನ ಆರ್ಥಿಕ ವರ್ಷದ ಬಂಡವಾಳ ವೆಚ್ಚದ ಕೇಂದ್ರ ಬಿಂದುವಾಗಿ ನೀರಾವರಿ, ಗ್ರಾಮೀಣ ಸಂಪರ್ಕ ಮತ್ತು ಕುಡಿಯುವ ನೀರಿಗೆ ಆದ್ಯತೆ ನೀಡಲಾಗಿದೆ. ಕಳೆದ ಹಂಗಾಮಿನಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಮಳೆ ಕೊರತೆ ದಾಖಲಿಸಿದ ಜಿಲ್ಲೆಗಳಿಗೆ ಗಣನೀಯ ಪಾಲು ಮೀಸಲಿಡಲಾಗಿದೆ.

ಬಜೆಟ್ ಜೊತೆಗಿನ ಇಲಾಖಾ ಟಿಪ್ಪಣಿಗಳ ಪ್ರಕಾರ, ಏತ ನೀರಾವರಿ ಯೋಜನೆಗಳು, ಕಾಲುವೆ ಆಧುನೀಕರಣ ಮತ್ತು ಕೆರೆ ಪುನಶ್ಚೇತನಕ್ಕೆ ಅತಿ ದೊಡ್ಡ ಮೊತ್ತ ಬಳಕೆಯಾಗಲಿದೆ. ಎರಡನೇ ಹಂತದ ಅನುದಾನವನ್ನು ರೈತ ಮಾರುಕಟ್ಟೆಗಳನ್ನು ರಾಜ್ಯ ಹೆದ್ದಾರಿಗಳಿಗೆ ಜೋಡಿಸುವ ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳ ಸುಧಾರಣೆಗೆ ಮೀಸಲಿಡಲಾಗಿದೆ.

ಈ ಬಾರಿ ಹೊಸ ಯೋಜನೆಗಳ ಘೋಷಣೆಗಿಂತ ಈಗಾಗಲೇ ಪ್ರಗತಿಯಲ್ಲಿರುವ ಕಾಮಗಾರಿಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸುವುದಕ್ಕೆ ಒತ್ತು ನೀಡಲಾಗಿದೆ ಎಂದು ಆರ್ಥಿಕ ಇಲಾಖೆ ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ. ಅನುದಾನ ಬಿಡುಗಡೆಯನ್ನು ಕಾಮಗಾರಿಯ ಭೌತಿಕ ಪ್ರಗತಿಗೆ ತಳಕು ಹಾಕಲಾಗುವುದು.

ರಾಜ್ಯದ ಆರ್ಥಿಕ ಸ್ಥಿತಿ ಗಮನಿಸುತ್ತಿರುವ ತಜ್ಞರ ಪ್ರಕಾರ, ವರ್ಷದ ದ್ವಿತೀಯಾರ್ಧದ ತೆರಿಗೆ ಸಂಗ್ರಹವೇ ನಿರ್ಣಾಯಕವಾಗಲಿದೆ. ಬಜೆಟ್ ಮಧ್ಯಮ ಪ್ರಮಾಣದ ತೆರಿಗೆ ಬೆಳವಣಿಗೆಯನ್ನು ಊಹಿಸಿದ್ದು, ವಿತ್ತೀಯ ಕೊರತೆಯನ್ನು ನಿಗದಿತ ಮಿತಿಯೊಳಗೆ ಇರಿಸಿದೆ.`
    }
  },
  {
    slug: "metro-phase-three-tunnelling-east-corridor",
    category: ["bengaluru", CATEGORIES.bengaluru],
    district: "bengaluru-urban",
    image: IMAGE("photo-1596176530529-78163a4f7af2"),
    tags: ["Metro", "Urban Transport", "Bengaluru"],
    status: ArticleStatus.PUBLISHED,
    hours: 5,
    breaking: true,
    readingMinutes: 4,
    en: {
      title: "Tunnelling begins on the eastern metro corridor as traffic diversions take effect",
      subtitle: "Commuters on the arterial stretch should plan for altered routes over the next several months.",
      body: `Tunnelling work has begun on the eastern corridor of the metro's next phase, with the first boring machine lowered into the launch shaft this week. Traffic diversions along the arterial stretch came into effect the same day and are expected to remain in place while the underground drive continues.

The corridor is designed to link dense residential belts in the east to the existing interchange network, cutting a journey that currently takes over an hour by road at peak hours. Station boxes at three locations are already under construction, and utility shifting has been completed on most of the alignment.

Traffic police have advised commuters to use parallel routes during morning and evening peaks, and additional feeder buses have been deployed on the affected stretch. Local trade associations have asked for clearer signage and pedestrian access to shopfronts along the diverted section.

Project engineers said the drive will be monitored for ground settlement, with instrumentation installed along buildings closest to the alignment.`
    },
    kn: {
      title: "ಪೂರ್ವ ಮೆಟ್ರೋ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ಸುರಂಗ ಕಾಮಗಾರಿ ಆರಂಭ; ಸಂಚಾರ ಮಾರ್ಗ ಬದಲಾವಣೆ",
      subtitle: "ಮುಂದಿನ ಹಲವು ತಿಂಗಳು ಪರ್ಯಾಯ ಮಾರ್ಗ ಬಳಸುವಂತೆ ಪ್ರಯಾಣಿಕರಿಗೆ ಸೂಚನೆ.",
      body: `ಮೆಟ್ರೋದ ಮುಂದಿನ ಹಂತದ ಪೂರ್ವ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ಸುರಂಗ ಕಾಮಗಾರಿ ಆರಂಭವಾಗಿದ್ದು, ಮೊದಲ ಟನಲ್ ಬೋರಿಂಗ್ ಯಂತ್ರವನ್ನು ಈ ವಾರ ಶಾಫ್ಟ್‌ಗೆ ಇಳಿಸಲಾಗಿದೆ. ಅದೇ ದಿನದಿಂದ ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ಸಂಚಾರ ಮಾರ್ಗ ಬದಲಾವಣೆ ಜಾರಿಗೆ ಬಂದಿದೆ.

ಈ ಕಾರಿಡಾರ್ ಪೂರ್ವ ಭಾಗದ ದಟ್ಟ ವಸತಿ ಪ್ರದೇಶಗಳನ್ನು ಈಗಿನ ಇಂಟರ್‌ಚೇಂಜ್ ಜಾಲಕ್ಕೆ ಜೋಡಿಸಲಿದೆ. ಸದ್ಯ ರಸ್ತೆ ಮಾರ್ಗದಲ್ಲಿ ಒಂದು ಗಂಟೆಗೂ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುವ ಪ್ರಯಾಣ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗಲಿದೆ.

ಬೆಳಗ್ಗೆ ಮತ್ತು ಸಂಜೆ ದಟ್ಟಣೆ ವೇಳೆ ಪರ್ಯಾಯ ಮಾರ್ಗ ಬಳಸುವಂತೆ ಸಂಚಾರ ಪೊಲೀಸರು ಸಲಹೆ ನೀಡಿದ್ದಾರೆ. ಬಾಧಿತ ಮಾರ್ಗದಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಫೀಡರ್ ಬಸ್‌ಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.

ಕಾಮಗಾರಿ ವೇಳೆ ಭೂಮಿ ಕುಸಿತದ ಮೇಲೆ ನಿಗಾ ಇರಿಸಲಾಗುವುದು ಎಂದು ಯೋಜನಾ ಎಂಜಿನಿಯರ್‌ಗಳು ತಿಳಿಸಿದ್ದಾರೆ.`
    }
  },
  {
    slug: "coastal-districts-heavy-rain-alert",
    category: ["karnataka", CATEGORIES.karnataka],
    district: "dakshina-kannada",
    image: IMAGE("photo-1500382017468-9049fed747ef"),
    tags: ["Monsoon", "Weather", "Coastal Karnataka"],
    status: ArticleStatus.PUBLISHED,
    hours: 8,
    breaking: true,
    readingMinutes: 3,
    en: {
      title: "Heavy rain alert for coastal districts; fishing suspended along the shoreline",
      subtitle: "District administrations have opened control rooms and kept relief centres on standby.",
      body: `A heavy rain alert is in force for the coastal districts, with the weather office forecasting intense spells over the next 48 hours accompanied by strong winds along the shoreline. Fishing has been suspended and boats have been advised to remain in harbour.

District administrations have opened round-the-clock control rooms, and relief centres in low-lying wards have been kept on standby. Schools in the worst-affected taluks have been given the option to declare a holiday depending on local conditions.

Officials have asked residents in areas prone to waterlogging to avoid unnecessary travel and to report blocked storm-water drains to the local ward office. Power utilities have deployed additional field teams to handle outages caused by fallen branches and cable faults.

Ferry services on the inland waterways have been curtailed, and traffic on ghat sections is being monitored for landslip risk.`
    },
    kn: {
      title: "ಕರಾವಳಿ ಜಿಲ್ಲೆಗಳಿಗೆ ಭಾರಿ ಮಳೆ ಎಚ್ಚರಿಕೆ; ಮೀನುಗಾರಿಕೆ ಸ್ಥಗಿತ",
      subtitle: "ಜಿಲ್ಲಾಡಳಿತಗಳಿಂದ ನಿಯಂತ್ರಣ ಕೊಠಡಿ ಆರಂಭ; ಪರಿಹಾರ ಕೇಂದ್ರಗಳು ಸನ್ನದ್ಧ.",
      body: `ಕರಾವಳಿ ಜಿಲ್ಲೆಗಳಿಗೆ ಭಾರಿ ಮಳೆ ಎಚ್ಚರಿಕೆ ಜಾರಿಯಲ್ಲಿದ್ದು, ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ತೀವ್ರ ಮಳೆ ಮತ್ತು ಬಿರುಗಾಳಿ ಸಾಧ್ಯತೆ ಇದೆ ಎಂದು ಹವಾಮಾನ ಇಲಾಖೆ ತಿಳಿಸಿದೆ. ಮೀನುಗಾರಿಕೆಯನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲಾಗಿದ್ದು, ದೋಣಿಗಳು ಬಂದರಿನಲ್ಲೇ ಇರುವಂತೆ ಸೂಚಿಸಲಾಗಿದೆ.

ಜಿಲ್ಲಾಡಳಿತಗಳು ದಿನವಿಡೀ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ನಿಯಂತ್ರಣ ಕೊಠಡಿಗಳನ್ನು ತೆರೆದಿವೆ. ತಗ್ಗು ಪ್ರದೇಶಗಳ ಪರಿಹಾರ ಕೇಂದ್ರಗಳನ್ನು ಸಿದ್ಧ ಸ್ಥಿತಿಯಲ್ಲಿ ಇರಿಸಲಾಗಿದೆ.

ಅನಗತ್ಯ ಪ್ರಯಾಣ ತಪ್ಪಿಸುವಂತೆ ಮತ್ತು ಕಟ್ಟಿಕೊಂಡ ಚರಂಡಿಗಳ ಬಗ್ಗೆ ವಾರ್ಡ್ ಕಚೇರಿಗೆ ಮಾಹಿತಿ ನೀಡುವಂತೆ ಅಧಿಕಾರಿಗಳು ಮನವಿ ಮಾಡಿದ್ದಾರೆ. ವಿದ್ಯುತ್ ಸರಬರಾಜು ಸಂಸ್ಥೆಗಳು ಹೆಚ್ಚುವರಿ ತಂಡಗಳನ್ನು ನಿಯೋಜಿಸಿವೆ.

ಒಳನಾಡು ಜಲಮಾರ್ಗಗಳ ದೋಣಿ ಸೇವೆ ಸೀಮಿತಗೊಳಿಸಲಾಗಿದ್ದು, ಘಾಟ್ ಪ್ರದೇಶಗಳಲ್ಲಿ ಭೂಕುಸಿತದ ಅಪಾಯದ ಮೇಲೆ ನಿಗಾ ಇಡಲಾಗಿದೆ.`
    }
  },
  {
    slug: "data-protection-rules-parliament-panel",
    category: ["india", CATEGORIES.india],
    image: IMAGE("photo-1518005020951-eccb494ad742"),
    tags: ["Policy", "Data Protection", "Parliament"],
    status: ArticleStatus.PUBLISHED,
    hours: 12,
    readingMinutes: 5,
    en: {
      title: "Parliamentary panel takes up draft data protection rules for consultation",
      subtitle: "Industry bodies and civil society groups have been invited to submit written views.",
      body: `A parliamentary standing committee has taken up the draft rules framed under the data protection law for detailed consultation, inviting written submissions from industry bodies, civil society organisations and state governments.

The draft covers consent mechanisms, the obligations of entities that process large volumes of personal data, and the timelines within which users must be notified of a breach. A separate section deals with the handling of children's data and the verification steps platforms are expected to follow.

Technology industry associations have sought clarity on cross-border data transfers and on the compliance burden for smaller firms. Digital rights groups have argued for narrower exemptions and for a clearer appeals process for individuals.

The committee is expected to hold oral evidence sessions before finalising its report. Officials indicated that the rules will be notified in phases to give organisations time to adapt their systems.`
    },
    kn: {
      title: "ದತ್ತಾಂಶ ಸಂರಕ್ಷಣಾ ಕರಡು ನಿಯಮಗಳ ಪರಿಶೀಲನೆಗೆ ಸಂಸದೀಯ ಸಮಿತಿ",
      subtitle: "ಉದ್ಯಮ ಸಂಘಟನೆಗಳು ಮತ್ತು ನಾಗರಿಕ ಸಂಘಟನೆಗಳಿಂದ ಲಿಖಿತ ಅಭಿಪ್ರಾಯ ಆಹ್ವಾನ.",
      body: `ದತ್ತಾಂಶ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆಯಡಿ ರೂಪಿಸಲಾದ ಕರಡು ನಿಯಮಗಳ ಸವಿಸ್ತಾರ ಪರಿಶೀಲನೆಯನ್ನು ಸಂಸದೀಯ ಸ್ಥಾಯಿ ಸಮಿತಿ ಕೈಗೆತ್ತಿಕೊಂಡಿದೆ. ಉದ್ಯಮ ಸಂಘಟನೆಗಳು, ನಾಗರಿಕ ಸಂಘಟನೆಗಳು ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರಗಳಿಂದ ಲಿಖಿತ ಅಭಿಪ್ರಾಯ ಆಹ್ವಾನಿಸಲಾಗಿದೆ.

ಒಪ್ಪಿಗೆ ಪಡೆಯುವ ವಿಧಾನ, ದೊಡ್ಡ ಪ್ರಮಾಣದ ವೈಯಕ್ತಿಕ ದತ್ತಾಂಶ ನಿರ್ವಹಿಸುವ ಸಂಸ್ಥೆಗಳ ಜವಾಬ್ದಾರಿ ಮತ್ತು ಸೋರಿಕೆ ಸಂಭವಿಸಿದಾಗ ಬಳಕೆದಾರರಿಗೆ ಮಾಹಿತಿ ನೀಡುವ ಕಾಲಮಿತಿ ಕರಡಿನಲ್ಲಿ ಸೇರಿವೆ.

ಗಡಿಯಾಚೆಗಿನ ದತ್ತಾಂಶ ವರ್ಗಾವಣೆ ಮತ್ತು ಸಣ್ಣ ಸಂಸ್ಥೆಗಳ ಮೇಲಿನ ಅನುಸರಣಾ ಹೊರೆ ಕುರಿತು ಸ್ಪಷ್ಟತೆ ಬೇಕೆಂದು ತಂತ್ರಜ್ಞಾನ ಉದ್ಯಮ ಸಂಘಟನೆಗಳು ಕೋರಿವೆ.

ವರದಿ ಅಂತಿಮಗೊಳಿಸುವ ಮುನ್ನ ಸಮಿತಿ ಮೌಖಿಕ ಸಾಕ್ಷ್ಯ ಸಂಗ್ರಹಿಸುವ ನಿರೀಕ್ಷೆ ಇದೆ. ನಿಯಮಗಳನ್ನು ಹಂತ ಹಂತವಾಗಿ ಜಾರಿಗೊಳಿಸಲಾಗುವುದು ಎಂದು ಅಧಿಕಾರಿಗಳು ಸೂಚಿಸಿದ್ದಾರೆ.`
    }
  },
  {
    slug: "startup-funding-rebound-tech-corridor",
    category: ["business", CATEGORIES.business],
    district: "bengaluru-urban",
    image: IMAGE("photo-1460925895917-afdab827c52f"),
    tags: ["Startups", "Funding", "Economy"],
    status: ArticleStatus.PUBLISHED,
    hours: 18,
    readingMinutes: 4,
    en: {
      title: "Startup funding shows a modest rebound after four subdued quarters",
      subtitle: "Deal counts remain below the peak, but late-stage cheques have returned to the table.",
      body: `Startup funding in the state showed a modest rebound in the last quarter after four subdued periods, with late-stage investors returning to deals in enterprise software, climate technology and health services.

Deal counts remain well below the peak recorded two years ago, and investors continue to price rounds conservatively. Founders report longer diligence cycles and greater scrutiny of unit economics, particularly for consumer businesses that rely on discounting to acquire users.

Early-stage activity has held up better than the headline numbers suggest, helped by a steady flow of first cheques into small teams spinning out of larger technology firms. Several of these companies are building tools for domestic small businesses rather than for export markets.

Industry associations expect hiring to pick up gradually, though at compensation levels below the boom period.`
    },
    kn: {
      title: "ನಾಲ್ಕು ತ್ರೈಮಾಸಿಕಗಳ ಮಂದಗತಿಯ ಬಳಿಕ ಸ್ಟಾರ್ಟಪ್ ಬಂಡವಾಳ ಹೂಡಿಕೆಯಲ್ಲಿ ಚೇತರಿಕೆ",
      subtitle: "ಒಪ್ಪಂದಗಳ ಸಂಖ್ಯೆ ಗರಿಷ್ಠ ಮಟ್ಟಕ್ಕಿಂತ ಕಡಿಮೆ; ಆದರೆ ಕೊನೆಯ ಹಂತದ ಹೂಡಿಕೆ ಮರಳಿದೆ.",
      body: `ನಾಲ್ಕು ತ್ರೈಮಾಸಿಕಗಳ ಮಂದಗತಿಯ ಬಳಿಕ ರಾಜ್ಯದಲ್ಲಿ ಸ್ಟಾರ್ಟಪ್ ಬಂಡವಾಳ ಹೂಡಿಕೆ ಸಾಧಾರಣ ಚೇತರಿಕೆ ಕಂಡಿದೆ. ಎಂಟರ್‌ಪ್ರೈಸ್ ಸಾಫ್ಟ್‌ವೇರ್, ಪರಿಸರ ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಆರೋಗ್ಯ ಸೇವೆಗಳಲ್ಲಿ ಕೊನೆಯ ಹಂತದ ಹೂಡಿಕೆದಾರರು ಮರಳಿದ್ದಾರೆ.

ಎರಡು ವರ್ಷಗಳ ಹಿಂದಿನ ಗರಿಷ್ಠ ಮಟ್ಟಕ್ಕೆ ಹೋಲಿಸಿದರೆ ಒಪ್ಪಂದಗಳ ಸಂಖ್ಯೆ ಇನ್ನೂ ಕಡಿಮೆ ಇದೆ. ವಿಶೇಷವಾಗಿ ರಿಯಾಯಿತಿ ಆಧಾರಿತ ಗ್ರಾಹಕ ಉದ್ಯಮಗಳ ಘಟಕ ಆರ್ಥಿಕತೆಯ ಬಗ್ಗೆ ಹೂಡಿಕೆದಾರರ ಪರಿಶೀಲನೆ ಹೆಚ್ಚಾಗಿದೆ.

ದೊಡ್ಡ ತಂತ್ರಜ್ಞಾನ ಸಂಸ್ಥೆಗಳಿಂದ ಹೊರಬಂದ ಸಣ್ಣ ತಂಡಗಳಿಗೆ ಮೊದಲ ಹಂತದ ಹೂಡಿಕೆ ನಿರಂತರವಾಗಿ ಹರಿದುಬರುತ್ತಿದ್ದು, ಆರಂಭಿಕ ಹಂತದ ಚಟುವಟಿಕೆ ಸ್ಥಿರವಾಗಿದೆ.

ನೇಮಕಾತಿ ಕ್ರಮೇಣ ಚೇತರಿಸಿಕೊಳ್ಳಲಿದೆ ಎಂದು ಉದ್ಯಮ ಸಂಘಟನೆಗಳು ನಿರೀಕ್ಷಿಸಿವೆ.`
    }
  },
  {
    slug: "ai-skilling-programme-college-students",
    category: ["technology", CATEGORIES.technology],
    image: IMAGE("photo-1517048676732-d65bc937f952"),
    tags: ["AI", "Skilling", "Education"],
    status: ArticleStatus.PUBLISHED,
    hours: 26,
    featured: true,
    readingMinutes: 4,
    en: {
      title: "State rolls out an AI skilling programme across engineering colleges",
      subtitle: "The curriculum will run alongside regular semesters and end with a project assessment.",
      body: `A state-backed skilling programme in artificial intelligence and data engineering is being rolled out across engineering and polytechnic colleges, with the first cohort starting in the coming semester.

The curriculum runs alongside regular coursework and covers applied machine learning, data handling, model evaluation and the practical questions of deploying software responsibly. Assessment is project-based, and colleges have been asked to pair students with a mentor from industry wherever possible.

Faculty training sessions have been scheduled ahead of the rollout, since several participating institutions do not currently teach these subjects. The programme also sets aside seats for students from government colleges in district headquarters, where access to such training has been limited.

Placement cells expect the certification to help graduates from smaller campuses compete for entry-level roles that have so far concentrated in a handful of urban institutions.`
    },
    kn: {
      title: "ಎಂಜಿನಿಯರಿಂಗ್ ಕಾಲೇಜುಗಳಲ್ಲಿ ಎಐ ಕೌಶಲ್ಯ ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮ ಆರಂಭ",
      subtitle: "ನಿಯಮಿತ ಸೆಮಿಸ್ಟರ್ ಜೊತೆಗೆ ತರಗತಿಗಳು; ಯೋಜನಾ ಆಧಾರಿತ ಮೌಲ್ಯಮಾಪನ.",
      body: `ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ದತ್ತಾಂಶ ಎಂಜಿನಿಯರಿಂಗ್ ಕುರಿತ ಸರ್ಕಾರಿ ಬೆಂಬಲಿತ ಕೌಶಲ್ಯ ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮವನ್ನು ಎಂಜಿನಿಯರಿಂಗ್ ಮತ್ತು ಪಾಲಿಟೆಕ್ನಿಕ್ ಕಾಲೇಜುಗಳಲ್ಲಿ ಆರಂಭಿಸಲಾಗುತ್ತಿದೆ. ಮೊದಲ ತಂಡ ಮುಂದಿನ ಸೆಮಿಸ್ಟರ್‌ನಲ್ಲಿ ಆರಂಭವಾಗಲಿದೆ.

ಈ ಪಠ್ಯಕ್ರಮ ಅನ್ವಯಿಕ ಯಂತ್ರ ಕಲಿಕೆ, ದತ್ತಾಂಶ ನಿರ್ವಹಣೆ, ಮಾದರಿ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ಸಾಫ್ಟ್‌ವೇರ್ ನಿಯೋಜನೆಯ ಪ್ರಾಯೋಗಿಕ ಅಂಶಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.

ಭಾಗವಹಿಸುವ ಹಲವು ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಈ ವಿಷಯಗಳು ಪ್ರಸ್ತುತ ಬೋಧನೆಯಾಗುತ್ತಿಲ್ಲದ ಕಾರಣ, ಬೋಧಕರಿಗೆ ಪೂರ್ವ ತರಬೇತಿ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ಜಿಲ್ಲಾ ಕೇಂದ್ರಗಳ ಸರ್ಕಾರಿ ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸೀಟುಗಳನ್ನು ಮೀಸಲಿಡಲಾಗಿದೆ.

ಸಣ್ಣ ಕ್ಯಾಂಪಸ್‌ಗಳ ಪದವೀಧರರಿಗೆ ಆರಂಭಿಕ ಹಂತದ ಉದ್ಯೋಗಗಳಿಗೆ ಸ್ಪರ್ಧಿಸಲು ಈ ಪ್ರಮಾಣಪತ್ರ ನೆರವಾಗಲಿದೆ ಎಂದು ನೇಮಕಾತಿ ವಿಭಾಗಗಳು ನಿರೀಕ್ಷಿಸಿವೆ.`
    }
  },
  {
    slug: "ranji-squad-announced-new-season",
    category: ["sports", CATEGORIES.sports],
    image: IMAGE("photo-1540747913346-19e32dc3e97e"),
    tags: ["Cricket", "Ranji Trophy", "Karnataka"],
    status: ArticleStatus.PUBLISHED,
    hours: 30,
    readingMinutes: 3,
    en: {
      title: "State squad announced for the new domestic season with three uncapped players",
      subtitle: "Selectors have backed form in the recent one-day competition over reputation.",
      body: `The state selection committee has announced a squad for the new domestic first-class season that includes three uncapped players, all of whom performed strongly in the recent one-day competition.

The batting order retains its experienced core, while the pace attack has been refreshed with two seamers from the state's age-group pipeline. The spin department remains unchanged, with the selectors citing consistency across last season's away fixtures.

The team's preparatory camp begins next week and will include a four-day intra-squad match at the main venue. Officials said workload management for the fast bowlers will be a priority given the compressed fixture list.

The season opens at home before a run of three consecutive away fixtures.`
    },
    kn: {
      title: "ಹೊಸ ದೇಶೀಯ ಋತುವಿಗೆ ರಾಜ್ಯ ತಂಡ ಪ್ರಕಟ; ಮೂವರು ಹೊಸಬರಿಗೆ ಅವಕಾಶ",
      subtitle: "ಇತ್ತೀಚಿನ ಏಕದಿನ ಟೂರ್ನಿಯ ಪ್ರದರ್ಶನಕ್ಕೆ ಆಯ್ಕೆಗಾರರ ಮನ್ನಣೆ.",
      body: `ಹೊಸ ದೇಶೀಯ ಪ್ರಥಮ ದರ್ಜೆ ಋತುವಿಗೆ ರಾಜ್ಯ ಆಯ್ಕೆ ಸಮಿತಿ ತಂಡ ಪ್ರಕಟಿಸಿದ್ದು, ಇತ್ತೀಚಿನ ಏಕದಿನ ಟೂರ್ನಿಯಲ್ಲಿ ಉತ್ತಮ ಪ್ರದರ್ಶನ ನೀಡಿದ ಮೂವರು ಹೊಸಬರಿಗೆ ಅವಕಾಶ ನೀಡಲಾಗಿದೆ.

ಬ್ಯಾಟಿಂಗ್ ಕ್ರಮದಲ್ಲಿ ಅನುಭವಿ ಆಟಗಾರರನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲಾಗಿದ್ದು, ವಯೋಮಾನ ವಿಭಾಗದಿಂದ ಇಬ್ಬರು ವೇಗಿಗಳನ್ನು ಸೇರ್ಪಡೆ ಮಾಡಲಾಗಿದೆ. ಸ್ಪಿನ್ ವಿಭಾಗದಲ್ಲಿ ಬದಲಾವಣೆ ಇಲ್ಲ.

ತಂಡದ ಪೂರ್ವಸಿದ್ಧತಾ ಶಿಬಿರ ಮುಂದಿನ ವಾರ ಆರಂಭವಾಗಲಿದ್ದು, ನಾಲ್ಕು ದಿನಗಳ ಆಂತರಿಕ ಪಂದ್ಯ ನಡೆಯಲಿದೆ. ವೇಗಿಗಳ ಕಾರ್ಯಭಾರ ನಿರ್ವಹಣೆಗೆ ಆದ್ಯತೆ ನೀಡಲಾಗುವುದು.

ಋತು ತವರಿನಲ್ಲಿ ಆರಂಭವಾಗಿ ಬಳಿಕ ಸತತ ಮೂರು ಹೊರರಾಜ್ಯ ಪಂದ್ಯಗಳು ನಡೆಯಲಿವೆ.`
    }
  },
  {
    slug: "areca-growers-price-support-demand",
    category: ["agriculture", CATEGORIES.agriculture],
    district: "shivamogga",
    image: IMAGE("photo-1574323347407-f5e1ad6d020b"),
    tags: ["Areca", "Farmers", "Malnad"],
    status: ArticleStatus.PUBLISHED,
    hours: 40,
    readingMinutes: 5,
    en: {
      title: "Areca growers seek a price floor as market rates swing through the season",
      subtitle: "Grower associations in the Malnad belt want procurement through cooperative channels.",
      body: `Areca growers in the Malnad belt have asked the state to consider a price floor after market rates moved sharply within a single season, leaving small holdings exposed at the point of sale.

Grower associations argue that the swings are driven less by local output than by trading patterns and imports, and that individual farmers with limited storage are forced to sell at the weakest point of the cycle. They have sought procurement through cooperative channels and better access to warehousing.

Horticulture department officials said a proposal on storage infrastructure is under examination, and that a survey of yield and acreage in the affected taluks is being compiled. Growers have separately raised concerns about leaf-spot disease in older plantations.

Traders in the regional markets said arrivals have been steady this season, with quality varying by taluk.`
    },
    kn: {
      title: "ಅಡಿಕೆ ಬೆಳೆಗಾರರಿಂದ ಬೆಂಬಲ ಬೆಲೆಗೆ ಆಗ್ರಹ; ಮಾರುಕಟ್ಟೆ ದರದಲ್ಲಿ ಏರಿಳಿತ",
      subtitle: "ಸಹಕಾರಿ ಮಾರ್ಗದ ಮೂಲಕ ಖರೀದಿಗೆ ಮಲೆನಾಡಿನ ಬೆಳೆಗಾರರ ಬೇಡಿಕೆ.",
      body: `ಒಂದೇ ಹಂಗಾಮಿನಲ್ಲಿ ಮಾರುಕಟ್ಟೆ ದರ ತೀವ್ರವಾಗಿ ಏರಿಳಿತ ಕಂಡ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಮಲೆನಾಡಿನ ಅಡಿಕೆ ಬೆಳೆಗಾರರು ಬೆಂಬಲ ಬೆಲೆ ನಿಗದಿಪಡಿಸುವಂತೆ ರಾಜ್ಯ ಸರ್ಕಾರವನ್ನು ಕೋರಿದ್ದಾರೆ.

ಸ್ಥಳೀಯ ಉತ್ಪಾದನೆಗಿಂತ ವಹಿವಾಟಿನ ಸ್ವರೂಪ ಮತ್ತು ಆಮದು ಈ ಏರಿಳಿತಕ್ಕೆ ಕಾರಣ ಎಂದು ಬೆಳೆಗಾರರ ಸಂಘಟನೆಗಳು ಹೇಳಿವೆ. ಸಂಗ್ರಹಣಾ ಸೌಲಭ್ಯ ಇಲ್ಲದ ಸಣ್ಣ ರೈತರು ಕಡಿಮೆ ದರಕ್ಕೆ ಮಾರಾಟ ಮಾಡುವ ಸ್ಥಿತಿ ಇದೆ.

ಸಂಗ್ರಹಣಾ ಮೂಲಸೌಕರ್ಯ ಕುರಿತ ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ ಎಂದು ತೋಟಗಾರಿಕೆ ಇಲಾಖೆ ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ. ಹಳೆಯ ತೋಟಗಳಲ್ಲಿ ಎಲೆಚುಕ್ಕಿ ರೋಗದ ಬಗ್ಗೆಯೂ ಬೆಳೆಗಾರರು ಆತಂಕ ವ್ಯಕ್ತಪಡಿಸಿದ್ದಾರೆ.

ಈ ಹಂಗಾಮಿನಲ್ಲಿ ಆವಕ ಸ್ಥಿರವಾಗಿದೆ ಎಂದು ಪ್ರಾದೇಶಿಕ ಮಾರುಕಟ್ಟೆಯ ವರ್ತಕರು ತಿಳಿಸಿದ್ದಾರೆ.`
    }
  },
  {
    slug: "udupi-harbour-facilities-expansion",
    category: ["districts", CATEGORIES.districts],
    district: "udupi",
    image: IMAGE("photo-1543269865-cbf427effbad"),
    tags: ["Fisheries", "Udupi", "Infrastructure"],
    status: ArticleStatus.PUBLISHED,
    hours: 52,
    readingMinutes: 4,
    en: {
      title: "Harbour facilities to be expanded as fishing fleet outgrows berthing space",
      subtitle: "The plan includes additional berths, an ice plant and a repaired approach road.",
      body: `Work has been sanctioned to expand harbour facilities in the district after the local fishing fleet outgrew available berthing space, leaving boats to anchor in crowded conditions during the peak season.

The plan covers additional berths, a new ice plant, repairs to the approach road and improved handling areas for the auction shed. Fisher associations have long argued that congestion at the harbour lengthens turnaround time and affects the quality of the catch before it reaches the market.

Officials said dredging will be taken up ahead of the next season, and that a drainage plan for the surrounding area is being prepared separately to reduce flooding during heavy rain.

Boat owners have asked for a phased schedule so that work does not overlap with the most active fishing months.`
    },
    kn: {
      title: "ಮೀನುಗಾರಿಕಾ ಬಂದರು ವಿಸ್ತರಣೆ; ದೋಣಿ ನಿಲುಗಡೆ ಸಮಸ್ಯೆಗೆ ಪರಿಹಾರ",
      subtitle: "ಹೆಚ್ಚುವರಿ ಬರ್ತ್, ಐಸ್ ಘಟಕ ಮತ್ತು ಸಂಪರ್ಕ ರಸ್ತೆ ದುರಸ್ತಿ ಯೋಜನೆಯಲ್ಲಿ ಸೇರ್ಪಡೆ.",
      body: `ಜಿಲ್ಲೆಯ ಮೀನುಗಾರಿಕಾ ದೋಣಿಗಳ ಸಂಖ್ಯೆ ಹೆಚ್ಚಾಗಿ ನಿಲುಗಡೆ ಸ್ಥಳ ಸಾಲದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಬಂದರು ಸೌಲಭ್ಯ ವಿಸ್ತರಣೆಗೆ ಕಾಮಗಾರಿ ಮಂಜೂರಾಗಿದೆ.

ಹೆಚ್ಚುವರಿ ಬರ್ತ್‌ಗಳು, ಹೊಸ ಐಸ್ ಘಟಕ, ಸಂಪರ್ಕ ರಸ್ತೆ ದುರಸ್ತಿ ಮತ್ತು ಹರಾಜು ಶೆಡ್‌ನ ಸುಧಾರಿತ ವ್ಯವಸ್ಥೆ ಯೋಜನೆಯಲ್ಲಿ ಸೇರಿವೆ. ಬಂದರಿನ ದಟ್ಟಣೆಯಿಂದ ಮೀನಿನ ಗುಣಮಟ್ಟ ಕುಸಿಯುತ್ತಿದೆ ಎಂದು ಮೀನುಗಾರರ ಸಂಘಟನೆಗಳು ಬಹುಕಾಲದಿಂದ ಹೇಳುತ್ತಿವೆ.

ಮುಂದಿನ ಹಂಗಾಮಿನ ಮುನ್ನ ಹೂಳೆತ್ತುವ ಕಾರ್ಯ ಕೈಗೊಳ್ಳಲಾಗುವುದು ಎಂದು ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ. ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಕ್ಕೆ ಪ್ರತ್ಯೇಕ ಚರಂಡಿ ಯೋಜನೆ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ.

ಮೀನುಗಾರಿಕೆ ಗರಿಷ್ಠ ಇರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ಕಾಮಗಾರಿ ನಡೆಯದಂತೆ ಹಂತ ಹಂತವಾಗಿ ಯೋಜಿಸುವಂತೆ ದೋಣಿ ಮಾಲೀಕರು ಕೋರಿದ್ದಾರೆ.`
    }
  },
  {
    slug: "district-hospitals-dialysis-units-expanded",
    category: ["health", CATEGORIES.health],
    district: "mysuru",
    image: IMAGE("photo-1516321318423-f06f85e504b3"),
    tags: ["Health", "Hospitals", "Dialysis"],
    status: ArticleStatus.PUBLISHED,
    hours: 64,
    readingMinutes: 4,
    en: {
      title: "Dialysis units expanded at district hospitals to cut travel for patients",
      subtitle: "Taluk-level centres will run a second shift where patient load justifies it.",
      body: `Dialysis capacity at district and taluk hospitals is being expanded, with additional machines installed and a second shift planned at centres where patient load justifies it.

Health officials said the aim is to reduce the distance patients travel for routine sessions, which currently forces many families in outlying taluks to make repeated trips to the district headquarters. Technician training has been scheduled alongside the equipment rollout, as staffing rather than machines has been the binding constraint at several centres.

The department is also reviewing the supply chain for consumables, after hospitals reported intermittent shortages that interrupted schedules. A helpline is being set up so patients can confirm slot availability before travelling.

Patient groups have welcomed the expansion and asked that transport allowances be processed more quickly.`
    },
    kn: {
      title: "ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಡಯಾಲಿಸಿಸ್ ಘಟಕ ವಿಸ್ತರಣೆ; ರೋಗಿಗಳ ಪ್ರಯಾಣ ಹೊರೆ ಇಳಿಕೆ",
      subtitle: "ರೋಗಿಗಳ ಸಂಖ್ಯೆ ಹೆಚ್ಚಿರುವ ಕಡೆ ತಾಲ್ಲೂಕು ಕೇಂದ್ರಗಳಲ್ಲಿ ಎರಡನೇ ಪಾಳಿ.",
      body: `ಜಿಲ್ಲಾ ಮತ್ತು ತಾಲ್ಲೂಕು ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಡಯಾಲಿಸಿಸ್ ಸಾಮರ್ಥ್ಯ ವಿಸ್ತರಿಸಲಾಗುತ್ತಿದ್ದು, ಹೆಚ್ಚುವರಿ ಯಂತ್ರಗಳನ್ನು ಅಳವಡಿಸಲಾಗುತ್ತಿದೆ. ರೋಗಿಗಳ ಸಂಖ್ಯೆ ಹೆಚ್ಚಿರುವ ಕೇಂದ್ರಗಳಲ್ಲಿ ಎರಡನೇ ಪಾಳಿ ಆರಂಭಿಸುವ ಯೋಜನೆ ಇದೆ.

ನಿಯಮಿತ ಚಿಕಿತ್ಸೆಗಾಗಿ ರೋಗಿಗಳು ದೂರ ಪ್ರಯಾಣಿಸುವುದನ್ನು ತಪ್ಪಿಸುವುದು ಇದರ ಉದ್ದೇಶ ಎಂದು ಆರೋಗ್ಯ ಇಲಾಖೆ ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ. ಹಲವು ಕೇಂದ್ರಗಳಲ್ಲಿ ಯಂತ್ರಗಳಿಗಿಂತ ಸಿಬ್ಬಂದಿ ಕೊರತೆಯೇ ಸಮಸ್ಯೆಯಾಗಿದ್ದು, ತಂತ್ರಜ್ಞರ ತರಬೇತಿ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.

ಚಿಕಿತ್ಸಾ ಸಾಮಗ್ರಿಗಳ ಪೂರೈಕೆ ಸರಪಳಿಯನ್ನೂ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. ಸ್ಲಾಟ್ ಲಭ್ಯತೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಸಹಾಯವಾಣಿ ಆರಂಭಿಸಲಾಗುತ್ತಿದೆ.

ಪ್ರಯಾಣ ಭತ್ಯೆಯನ್ನು ಶೀಘ್ರ ವಿತರಿಸುವಂತೆ ರೋಗಿಗಳ ಸಂಘಟನೆಗಳು ಕೋರಿವೆ.`
    }
  },
  {
    slug: "kannada-cinema-strong-quarter-box-office",
    category: ["entertainment", CATEGORIES.entertainment],
    image: IMAGE("photo-1489599849927-2ee91cede3ba"),
    tags: ["Cinema", "Sandalwood", "Box Office"],
    status: ArticleStatus.PUBLISHED,
    hours: 72,
    readingMinutes: 3,
    en: {
      title: "Kannada cinema posts a strong quarter as mid-budget films find audiences",
      subtitle: "Distributors report steady occupancy in single screens outside the capital.",
      body: `Kannada cinema recorded a strong quarter at the box office, driven less by large-budget releases than by a run of mid-budget films that held their screens for several weeks.

Distributors said occupancy has been steady in single screens outside the capital, where word-of-mouth continues to matter more than opening-weekend marketing. Several of the successful titles were made by first-time directors working with modest budgets and shorter shooting schedules.

Exhibitors point to a crowded release calendar as the main risk for the coming quarter, with multiple titles targeting the same festival window. Producers' associations have suggested staggering release dates to avoid splitting audiences.

Streaming deals for the quarter's titles are being negotiated, though platforms have become more selective about acquisition prices.`
    },
    kn: {
      title: "ಮಧ್ಯಮ ಬಜೆಟ್ ಚಿತ್ರಗಳ ಯಶಸ್ಸು; ಕನ್ನಡ ಚಿತ್ರರಂಗಕ್ಕೆ ಉತ್ತಮ ತ್ರೈಮಾಸಿಕ",
      subtitle: "ರಾಜಧಾನಿಯಾಚೆಗಿನ ಏಕಪರದೆ ಚಿತ್ರಮಂದಿರಗಳಲ್ಲಿ ಸ್ಥಿರ ಪ್ರೇಕ್ಷಕ ಸಂಖ್ಯೆ.",
      body: `ದೊಡ್ಡ ಬಜೆಟ್ ಚಿತ್ರಗಳಿಗಿಂತ ಮಧ್ಯಮ ಬಜೆಟ್ ಚಿತ್ರಗಳ ಸತತ ಯಶಸ್ಸಿನಿಂದ ಕನ್ನಡ ಚಿತ್ರರಂಗ ಈ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ಉತ್ತಮ ಗಳಿಕೆ ದಾಖಲಿಸಿದೆ. ಹಲವು ಚಿತ್ರಗಳು ವಾರಗಟ್ಟಲೆ ಪ್ರದರ್ಶನ ಕಂಡಿವೆ.

ರಾಜಧಾನಿಯಾಚೆಗಿನ ಏಕಪರದೆ ಚಿತ್ರಮಂದಿರಗಳಲ್ಲಿ ಪ್ರೇಕ್ಷಕರ ಸಂಖ್ಯೆ ಸ್ಥಿರವಾಗಿದೆ ಎಂದು ವಿತರಕರು ತಿಳಿಸಿದ್ದಾರೆ. ಯಶಸ್ವಿ ಚಿತ್ರಗಳಲ್ಲಿ ಹಲವು ಹೊಸ ನಿರ್ದೇಶಕರ ಕೃತಿಗಳಾಗಿವೆ.

ಮುಂದಿನ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ಬಿಡುಗಡೆಗಳ ದಟ್ಟಣೆಯೇ ಪ್ರಮುಖ ಸವಾಲು ಎಂದು ಪ್ರದರ್ಶಕರು ಹೇಳಿದ್ದಾರೆ. ಬಿಡುಗಡೆ ದಿನಾಂಕಗಳನ್ನು ಹಂಚಿಕೆ ಮಾಡುವಂತೆ ನಿರ್ಮಾಪಕರ ಸಂಘ ಸಲಹೆ ನೀಡಿದೆ.

ಸ್ಟ್ರೀಮಿಂಗ್ ಒಪ್ಪಂದಗಳ ಮಾತುಕತೆ ನಡೆಯುತ್ತಿದ್ದು, ವೇದಿಕೆಗಳು ಖರೀದಿ ದರದ ವಿಷಯದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸಿವೆ.`
    }
  },
  {
    slug: "new-government-college-campus-opens",
    category: ["education", CATEGORIES.education],
    district: "tumakuru",
    image: IMAGE("photo-1541339907198-e08756dedf3f"),
    tags: ["Education", "Colleges", "Tumakuru"],
    status: ArticleStatus.PUBLISHED,
    hours: 90,
    readingMinutes: 3,
    en: {
      title: "New government college campus opens with laboratories and a hostel block",
      subtitle: "Admissions for the first batch will follow the regular counselling schedule.",
      body: `A new government college campus has opened in the district, with laboratory blocks, a library and a hostel wing for students travelling from surrounding taluks.

The campus is expected to relieve pressure on the existing college in the taluk headquarters, where enrolment has grown faster than classroom capacity over the last few years. Admissions for the first batch will follow the regular counselling schedule.

Faculty recruitment is under way, and the department has said that guest lecturers will cover the gap for the first semester. Local representatives have asked for a bus route linking the campus to the town, since the site is some distance from the main road.

Laboratory equipment for the science streams has been delivered, and the library is being stocked in phases.`
    },
    kn: {
      title: "ಹೊಸ ಸರ್ಕಾರಿ ಕಾಲೇಜು ಕ್ಯಾಂಪಸ್ ಉದ್ಘಾಟನೆ; ಪ್ರಯೋಗಾಲಯ, ವಸತಿ ನಿಲಯ ಸೌಲಭ್ಯ",
      subtitle: "ಮೊದಲ ತಂಡದ ಪ್ರವೇಶ ನಿಯಮಿತ ಕೌನ್ಸೆಲಿಂಗ್ ವೇಳಾಪಟ್ಟಿಯಂತೆ.",
      body: `ಜಿಲ್ಲೆಯಲ್ಲಿ ಹೊಸ ಸರ್ಕಾರಿ ಕಾಲೇಜು ಕ್ಯಾಂಪಸ್ ಆರಂಭವಾಗಿದ್ದು, ಪ್ರಯೋಗಾಲಯ, ಗ್ರಂಥಾಲಯ ಮತ್ತು ಸುತ್ತಲಿನ ತಾಲ್ಲೂಕುಗಳ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಸತಿ ನಿಲಯ ಸೌಲಭ್ಯ ಕಲ್ಪಿಸಲಾಗಿದೆ.

ತಾಲ್ಲೂಕು ಕೇಂದ್ರದ ಈಗಿನ ಕಾಲೇಜಿನ ಮೇಲಿನ ಒತ್ತಡ ಕಡಿಮೆಯಾಗಲಿದೆ. ಕಳೆದ ಕೆಲವು ವರ್ಷಗಳಿಂದ ದಾಖಲಾತಿ ತರಗತಿ ಸಾಮರ್ಥ್ಯಕ್ಕಿಂತ ವೇಗವಾಗಿ ಬೆಳೆದಿತ್ತು.

ಬೋಧಕ ಸಿಬ್ಬಂದಿ ನೇಮಕಾತಿ ಪ್ರಗತಿಯಲ್ಲಿದ್ದು, ಮೊದಲ ಸೆಮಿಸ್ಟರ್‌ಗೆ ಅತಿಥಿ ಉಪನ್ಯಾಸಕರನ್ನು ನಿಯೋಜಿಸಲಾಗುವುದು. ಕ್ಯಾಂಪಸ್‌ಗೆ ಬಸ್ ಮಾರ್ಗ ಕಲ್ಪಿಸುವಂತೆ ಸ್ಥಳೀಯರು ಕೋರಿದ್ದಾರೆ.

ವಿಜ್ಞಾನ ವಿಭಾಗಗಳ ಪ್ರಯೋಗಾಲಯ ಸಲಕರಣೆ ಪೂರೈಕೆಯಾಗಿದ್ದು, ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹಂತ ಹಂತವಾಗಿ ಪುಸ್ತಕ ಸೇರ್ಪಡೆಯಾಗುತ್ತಿದೆ.`
    }
  },
  {
    slug: "local-body-poll-schedule-announced",
    category: ["politics", CATEGORIES.politics],
    image: IMAGE("photo-1541888946425-d81bb19240f5"),
    tags: ["Elections", "Local Bodies", "Politics"],
    status: ArticleStatus.REVIEW,
    hours: 3,
    readingMinutes: 4,
    en: {
      title: "Local body poll schedule announced; model code comes into force",
      subtitle: "Nominations open next week across the notified wards.",
      body: `The state election authority has announced the schedule for local body polls, with the model code of conduct coming into force in the notified areas from the day of the announcement.

Nominations open next week, followed by scrutiny and the withdrawal window. Polling will be held in a single phase in most districts, with a second phase where reorganisation of wards has been completed recently.

Officials said the electoral rolls have been updated and that polling stations in areas with difficult access have been mapped in advance. Parties have been asked to route permission requests for public meetings through the district administration.

Counting will follow two days after the final phase.`
    },
    kn: {
      title: "ಸ್ಥಳೀಯ ಸಂಸ್ಥೆ ಚುನಾವಣೆ ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟ; ಮಾದರಿ ನೀತಿ ಸಂಹಿತೆ ಜಾರಿ",
      subtitle: "ಅಧಿಸೂಚಿತ ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಮುಂದಿನ ವಾರದಿಂದ ನಾಮಪತ್ರ ಸಲ್ಲಿಕೆ.",
      body: `ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆ ವೇಳಾಪಟ್ಟಿಯನ್ನು ರಾಜ್ಯ ಚುನಾವಣಾ ಪ್ರಾಧಿಕಾರ ಪ್ರಕಟಿಸಿದ್ದು, ಅಧಿಸೂಚಿತ ಪ್ರದೇಶಗಳಲ್ಲಿ ಮಾದರಿ ನೀತಿ ಸಂಹಿತೆ ಜಾರಿಗೆ ಬಂದಿದೆ.

ಮುಂದಿನ ವಾರ ನಾಮಪತ್ರ ಸಲ್ಲಿಕೆ ಆರಂಭವಾಗಲಿದ್ದು, ಬಳಿಕ ಪರಿಶೀಲನೆ ಮತ್ತು ಹಿಂಪಡೆಯುವ ಅವಧಿ ಇರಲಿದೆ. ಹೆಚ್ಚಿನ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಒಂದೇ ಹಂತದಲ್ಲಿ ಮತದಾನ ನಡೆಯಲಿದೆ.

ಮತದಾರರ ಪಟ್ಟಿ ಪರಿಷ್ಕರಣೆಯಾಗಿದ್ದು, ತಲುಪಲು ಕಷ್ಟವಾದ ಪ್ರದೇಶಗಳ ಮತಗಟ್ಟೆಗಳನ್ನು ಮೊದಲೇ ಗುರುತಿಸಲಾಗಿದೆ ಎಂದು ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ.

ಅಂತಿಮ ಹಂತದ ಎರಡು ದಿನಗಳ ಬಳಿಕ ಮತ ಎಣಿಕೆ ನಡೆಯಲಿದೆ.`
    }
  },
  {
    slug: "lake-rejuvenation-work-belagavi",
    category: ["districts", CATEGORIES.districts],
    district: "belagavi",
    image: IMAGE("photo-1504384308090-c894fdcc538d"),
    tags: ["Lakes", "Environment", "Belagavi"],
    status: ArticleStatus.DRAFT,
    hours: 1,
    readingMinutes: 3,
    en: {
      title: "Lake rejuvenation work begins with desilting and bund repair",
      subtitle: "Residents' groups will be part of the monitoring committee.",
      body: `Rejuvenation work has begun on a cluster of lakes in the district, starting with desilting, bund repair and the construction of inlet screens to keep solid waste out of the water body.

Residents' associations that campaigned for the restoration will be represented on the monitoring committee, and the local body has agreed to publish quarterly progress notes. A survey of encroachments along the boundary is being completed alongside the civil work.

Officials said the silt removed will be offered to farmers in nearby villages, and that a walking path will be laid only after the water quality stabilises.`
    },
    kn: {
      title: "ಕೆರೆ ಪುನಶ್ಚೇತನ ಕಾಮಗಾರಿ ಆರಂಭ; ಹೂಳೆತ್ತುವಿಕೆ, ಏರಿ ದುರಸ್ತಿ",
      subtitle: "ನಿಗಾ ಸಮಿತಿಯಲ್ಲಿ ಸ್ಥಳೀಯ ನಿವಾಸಿಗಳ ಸಂಘಟನೆಗಳಿಗೂ ಸ್ಥಾನ.",
      body: `ಜಿಲ್ಲೆಯ ಕೆರೆಗಳ ಪುನಶ್ಚೇತನ ಕಾಮಗಾರಿ ಆರಂಭವಾಗಿದ್ದು, ಹೂಳೆತ್ತುವಿಕೆ, ಏರಿ ದುರಸ್ತಿ ಮತ್ತು ತ್ಯಾಜ್ಯ ತಡೆಯುವ ಜಾಲರಿ ಅಳವಡಿಕೆ ಮೊದಲ ಹಂತದಲ್ಲಿ ನಡೆಯಲಿದೆ.

ಪುನಶ್ಚೇತನಕ್ಕಾಗಿ ಹೋರಾಡಿದ ನಿವಾಸಿಗಳ ಸಂಘಟನೆಗಳಿಗೆ ನಿಗಾ ಸಮಿತಿಯಲ್ಲಿ ಪ್ರಾತಿನಿಧ್ಯ ನೀಡಲಾಗಿದೆ. ತ್ರೈಮಾಸಿಕ ಪ್ರಗತಿ ವರದಿ ಪ್ರಕಟಿಸಲು ಸ್ಥಳೀಯ ಸಂಸ್ಥೆ ಒಪ್ಪಿದೆ.

ತೆಗೆದ ಹೂಳನ್ನು ಸಮೀಪದ ಗ್ರಾಮಗಳ ರೈತರಿಗೆ ನೀಡಲಾಗುವುದು ಎಂದು ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ.`
    }
  },
  {
    slug: "coffee-estates-labour-shortage-kodagu",
    category: ["agriculture", CATEGORIES.agriculture],
    district: "kodagu",
    image: IMAGE("photo-1495020689067-958852a7765e"),
    tags: ["Coffee", "Kodagu", "Plantations"],
    status: ArticleStatus.APPROVED,
    hours: 6,
    readingMinutes: 4,
    en: {
      title: "Coffee estates report a labour shortage ahead of the picking season",
      subtitle: "Planters are turning to mechanised pulping and longer contracts to retain workers.",
      body: `Coffee estates are reporting a shortage of workers ahead of the picking season, with planters saying that migrant labour that once arrived reliably each year has thinned out.

Estates have responded by offering longer contracts, improving on-site housing and investing in mechanised pulping to reduce the number of hands needed at the processing stage. Smaller holdings, which cannot spread that cost, are the most exposed.

Planters' associations have asked for support on housing and for a review of the wage structure that accounts for the seasonal nature of the work. Officials said a district-level assessment of labour availability is under way.

Rainfall this season has been favourable for the crop, and estates expect a reasonable yield if picking is not delayed.`
    },
    kn: {
      title: "ಕೊಯ್ಲು ಹಂಗಾಮಿನ ಮುನ್ನ ಕಾಫಿ ತೋಟಗಳಲ್ಲಿ ಕಾರ್ಮಿಕರ ಕೊರತೆ",
      subtitle: "ಕಾರ್ಮಿಕರನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲು ದೀರ್ಘಾವಧಿ ಒಪ್ಪಂದ, ಯಾಂತ್ರೀಕರಣದ ಮೊರೆ.",
      body: `ಕೊಯ್ಲು ಹಂಗಾಮಿನ ಮುನ್ನ ಕಾಫಿ ತೋಟಗಳಲ್ಲಿ ಕಾರ್ಮಿಕರ ಕೊರತೆ ಕಂಡುಬಂದಿದೆ. ಪ್ರತಿ ವರ್ಷ ನಿಯಮಿತವಾಗಿ ಬರುತ್ತಿದ್ದ ವಲಸೆ ಕಾರ್ಮಿಕರ ಸಂಖ್ಯೆ ಕಡಿಮೆಯಾಗಿದೆ ಎಂದು ಬೆಳೆಗಾರರು ಹೇಳಿದ್ದಾರೆ.

ದೀರ್ಘಾವಧಿ ಒಪ್ಪಂದ, ಸುಧಾರಿತ ವಸತಿ ಮತ್ತು ಸಂಸ್ಕರಣೆಯಲ್ಲಿ ಯಾಂತ್ರೀಕರಣದ ಮೂಲಕ ತೋಟಗಳು ಇದಕ್ಕೆ ಸ್ಪಂದಿಸಿವೆ. ಸಣ್ಣ ಹಿಡುವಳಿದಾರರಿಗೆ ಈ ವೆಚ್ಚ ಭರಿಸುವುದು ಕಷ್ಟವಾಗಿದೆ.

ವಸತಿ ನೆರವು ಮತ್ತು ಕೂಲಿ ರಚನೆಯ ಪರಿಶೀಲನೆಗೆ ಬೆಳೆಗಾರರ ಸಂಘಟನೆಗಳು ಕೋರಿವೆ. ಜಿಲ್ಲಾ ಮಟ್ಟದ ಸಮೀಕ್ಷೆ ನಡೆಯುತ್ತಿದೆ ಎಂದು ಅಧಿಕಾರಿಗಳು ತಿಳಿಸಿದ್ದಾರೆ.

ಈ ಹಂಗಾಮಿನ ಮಳೆ ಬೆಳೆಗೆ ಪೂರಕವಾಗಿದ್ದು, ಕೊಯ್ಲು ವಿಳಂಬವಾಗದಿದ್ದರೆ ಉತ್ತಮ ಇಳುವರಿ ನಿರೀಕ್ಷೆ ಇದೆ.`
    }
  }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await prisma.language.upsert({ where: { code: "en" }, update: {}, create: { code: "en", name: "English" } });
  await prisma.language.upsert({ where: { code: "kn" }, update: {}, create: { code: "kn", name: "Kannada" } });

  for (const [slug, name] of Object.entries(CATEGORIES)) {
    await prisma.category.upsert({ where: { slug }, update: { name }, create: { slug, name } });
  }
  for (const [slug, nameEn, nameKn] of DISTRICTS) {
    await prisma.district.upsert({ where: { slug }, update: { nameEn, nameKn }, create: { slug, nameEn, nameKn } });
  }

  // Reporters file, editors publish — mirrors the real workflow.
  const reporter = await prisma.user.findUnique({ where: { email: "reporter@example.com" } });
  const editor = await prisma.user.findUnique({ where: { email: "editor@example.com" } });
  if (!reporter || !editor) {
    throw new Error("Run `npm run prisma:seed` first — the demo reporter/editor accounts are missing.");
  }

  for (const seed of ARTICLES) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: seed.category[0] } });
    const district = seed.district
      ? await prisma.district.findUnique({ where: { slug: seed.district } })
      : null;

    const createdAt = hoursAgo(seed.hours + 6);
    const submittedAt = hoursAgo(seed.hours + 3);
    const reviewedAt = hoursAgo(seed.hours + 1);
    const publishedAt = hoursAgo(seed.hours);

    const isPublished = seed.status === ArticleStatus.PUBLISHED;
    const isReviewed = isPublished || seed.status === ArticleStatus.APPROVED;
    const isSubmitted = isReviewed || seed.status === ArticleStatus.REVIEW;

    const base = {
      status: seed.status,
      categoryId: category.id,
      districtId: district?.id ?? null,
      authorId: reporter.id,
      reporterId: reporter.id,
      submittedById: isSubmitted ? reporter.id : null,
      reviewedById: isReviewed ? editor.id : null,
      publishedById: isPublished ? editor.id : null,
      featuredImage: seed.image,
      isBreaking: seed.breaking ?? false,
      isFeatured: seed.featured ?? false,
      readingMinutes: seed.readingMinutes ?? 4,
      createdAt,
      submittedAt: isSubmitted ? submittedAt : null,
      reviewedAt: isReviewed ? reviewedAt : null,
      publishedAt: isPublished ? publishedAt : null,
      views: Math.floor(Math.random() * 4000) + 250
    };

    const article = await prisma.article.upsert({
      where: { slug: seed.slug },
      update: base,
      create: { slug: seed.slug, ...base }
    });

    for (const [languageId, content, translationSlug] of [
      ["en", seed.en, seed.slug],
      ["kn", seed.kn, `${seed.slug}-kn`]
    ] as const) {
      const payload = {
        title: content.title,
        subtitle: content.subtitle,
        body: content.body,
        slug: translationSlug,
        seoTitle: content.title,
        seoDescription: content.subtitle,
        ogTitle: content.title,
        ogDescription: content.subtitle
      };
      await prisma.articleTranslation.upsert({
        where: { articleId_languageId: { articleId: article.id, languageId } },
        update: payload,
        create: { articleId: article.id, languageId, ...payload }
      });
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        tags: {
          set: [],
          connectOrCreate: seed.tags.map((tag) => ({
            where: { slug: slugify(tag) },
            create: { slug: slugify(tag), name: tag }
          }))
        }
      }
    });

    // Rebuild the audit trail so every seeded article has a believable history.
    await prisma.auditLog.deleteMany({ where: { articleId: article.id } });
    const trail: { action: string; old?: ArticleStatus; next: ArticleStatus; at: Date; actor: string }[] = [
      { action: "CREATED", next: ArticleStatus.DRAFT, at: createdAt, actor: reporter.id }
    ];
    if (isSubmitted) {
      trail.push({ action: "SUBMITTED_FOR_REVIEW", old: ArticleStatus.DRAFT, next: ArticleStatus.REVIEW, at: submittedAt, actor: reporter.id });
    }
    if (isReviewed) {
      trail.push({ action: "APPROVED", old: ArticleStatus.REVIEW, next: ArticleStatus.APPROVED, at: reviewedAt, actor: editor.id });
    }
    if (isPublished) {
      trail.push({ action: "PUBLISHED", old: ArticleStatus.APPROVED, next: ArticleStatus.PUBLISHED, at: publishedAt, actor: editor.id });
    }
    for (const entry of trail) {
      await prisma.auditLog.create({
        data: {
          entity: "Article",
          entityId: article.id,
          articleId: article.id,
          actorId: entry.actor,
          action: entry.action,
          oldStatus: entry.old,
          newStatus: entry.next,
          createdAt: entry.at
        }
      });
    }
  }

  const counts = await prisma.article.groupBy({ by: ["status"], _count: { _all: true } });
  console.log("newsroom filled:", counts.map((row) => `${row.status}=${row._count._all}`).join(" "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
