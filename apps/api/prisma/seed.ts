import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

/** Must mirror ROLES in src/common/rbac.ts, which owns the permission matrix. */
const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "SUB_EDITOR",
  "REPORTER",
  "TRANSLATOR",
  "FACT_CHECKER",
  "MODERATOR",
  "PHOTOGRAPHER",
  "VIDEO_EDITOR"
] as const;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

const DEMO_USERS = [
  { email: "admin@example.com", name: "Newsroom Admin", role: "ADMIN" },
  { email: "editor@example.com", name: "Editorial Desk", role: "EDITOR" },
  { email: "subeditor@example.com", name: "Sub Editor Desk", role: "SUB_EDITOR" },
  { email: "reporter@example.com", name: "District Reporter", role: "REPORTER" }
] as const;

async function main() {
  const en = await prisma.language.upsert({ where: { code: "en" }, update: {}, create: { code: "en", name: "English" }});
  const kn = await prisma.language.upsert({ where: { code: "kn" }, update: {}, create: { code: "kn", name: "Kannada" }});

  // Every editorial role exists as a row; the permission matrix lives in src/common/rbac.ts.
  const roles = new Map<string, string>();
  for (const name of ROLES) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
    roles.set(name, role.id);
  }

  for (const demo of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: demo.email },
      update: { roles: { set: [{ id: roles.get(demo.role)! }] } },
      create: {
        email: demo.email,
        name: demo.name,
        passwordHash: hash("ChangeMe123!"),
        roles: { connect: [{ id: roles.get(demo.role)! }] }
      }
    });
  }

  const editor = await prisma.user.findUniqueOrThrow({ where: { email: "editor@example.com" } });
  const category = await prisma.category.upsert({ where: { slug: "karnataka" }, update: {}, create: { slug: "karnataka", name: "Karnataka" }});
  const district = await prisma.district.upsert({ where: { slug: "dakshina-kannada" }, update: {}, create: { slug: "dakshina-kannada", nameEn: "Dakshina Kannada", nameKn: "ದಕ್ಷಿಣ ಕನ್ನಡ" }});
  const article = await prisma.article.upsert({
    where: { slug: "karnataka-budget-development" }, update: {},
    create: {
      slug: "karnataka-budget-development", categoryId: category.id, districtId: district.id,
      authorId: editor.id, reporterId: editor.id, status: "PUBLISHED", publishedAt: new Date(),
      publishedById: editor.id, isFeatured: true,
      translations: { create: [
        {
          languageId: en.code,
          slug: "karnataka-budget-development",
          title: "Karnataka Budget focuses on infrastructure and welfare",
          subtitle: "A growth-oriented package with major regional allocations.",
          body: "Editorial sample article body.",
          seoTitle: "Karnataka Budget focuses on infrastructure and welfare",
          seoDescription: "A growth-oriented Karnataka budget package with major regional allocations.",
          ogTitle: "Karnataka Budget focuses on infrastructure and welfare",
          ogDescription: "Major allocations for infrastructure, welfare and regional development."
        },
        {
          languageId: kn.code,
          slug: "karnataka-budget-development-kn",
          title: "ಕರ್ನಾಟಕ ಬಜೆಟ್ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಕಲ್ಯಾಣಕ್ಕೆ ಒತ್ತು",
          subtitle: "ಪ್ರಮುಖ ಪ್ರಾದೇಶಿಕ ಹಂಚಿಕೆಗಳೊಂದಿಗೆ ಅಭಿವೃದ್ಧಿ ಕೇಂದ್ರಿತ ಪ್ಯಾಕೇಜ್.",
          body: "ಮಾದರಿ ಕನ್ನಡ ಲೇಖನದ ವಿಷಯ.",
          seoTitle: "ಕರ್ನಾಟಕ ಬಜೆಟ್ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಕಲ್ಯಾಣಕ್ಕೆ ಒತ್ತು",
          seoDescription: "ಪ್ರಮುಖ ಪ್ರಾದೇಶಿಕ ಹಂಚಿಕೆಗಳೊಂದಿಗೆ ಅಭಿವೃದ್ಧಿ ಕೇಂದ್ರಿತ ಕರ್ನಾಟಕ ಬಜೆಟ್ ಪ್ಯಾಕೇಜ್.",
          ogTitle: "ಕರ್ನಾಟಕ ಬಜೆಟ್ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಕಲ್ಯಾಣಕ್ಕೆ ಒತ್ತು",
          ogDescription: "ಮೂಲಸೌಕರ್ಯ, ಕಲ್ಯಾಣ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಅಭಿವೃದ್ಧಿಗೆ ಪ್ರಮುಖ ಅನುದಾನಗಳು."
        }
      ]}
    }
  });
  console.log({ roles: roles.size, users: DEMO_USERS.map(u => u.email), article: article.slug });
}

main().finally(() => prisma.$disconnect());
