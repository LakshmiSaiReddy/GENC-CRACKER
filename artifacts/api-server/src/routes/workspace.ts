import { Router, type IRouter, type Request } from "express";
import { getAuth } from "@clerk/express";
import { phases, roadmapWeeks } from "@workspace/genc-data";
import {
  GetDashboardResponse,
  GetWorkspaceResponse,
  SaveWorkspaceBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";

const router: IRouter = Router();
type WorkspaceState = ReturnType<typeof GetWorkspaceResponse.parse>;

const TOPIC_COUNTS = roadmapWeeks.map((week) => week.topics.length);

function createDefaultWorkspace(): WorkspaceState {
  return GetWorkspaceResponse.parse({
    profile: {
      studentName: "Lakshmi Sai Reddy",
      course: "B.Tech – CSE (Cybersecurity)",
      institute: "Madanapalle Institute of Technology and Science",
      target: "Cognizant GenC Next + Cybersecurity + Cloud Security",
      preparationWeeks: 40,
    },
    completedTopics: [],
    completedWeeks: [],
    resourceProgress: [],
    codingProblems: [],
    sqlEntries: [],
    dailyTasks: [],
    weekNotes: [],
    projectMilestones: [],
    mockTests: [],
    certificates: [
      {
        id: "cisco-intro-cybersecurity",
        name: "Introduction to Cybersecurity",
        issuer: "Cisco Networking Academy",
        completed: false,
        completedAt: null,
        url: "https://skillsforall.com/course/introduction-to-cybersecurity",
      },
      {
        id: "aws-cloud-practitioner",
        name: "AWS Cloud Practitioner Essentials",
        issuer: "AWS Skill Builder",
        completed: false,
        completedAt: null,
        url: "https://skillbuilder.aws/learn",
      },
      {
        id: "microsoft-azure-fundamentals",
        name: "Azure Fundamentals learning path",
        issuer: "Microsoft Learn",
        completed: false,
        completedAt: null,
        url: "https://learn.microsoft.com/training/paths/azure-fundamentals/",
      },
    ],
    interviewAnswers: [
      { id: "self-introduction", prompt: "Introduce yourself in one minute and explain what brought you to cybersecurity.", answer: "", section: "HR & behavioral" },
      { id: "why-cognizant", prompt: "Why are you interested in Cognizant and the GenC Next role?", answer: "", section: "HR & behavioral" },
      { id: "why-cybersecurity", prompt: "Why did you choose cybersecurity, and what part of it interests you most?", answer: "", section: "HR & behavioral" },
      { id: "strengths", prompt: "What are your strengths? Give a specific example.", answer: "", section: "HR & behavioral" },
      { id: "weaknesses", prompt: "What is one area you are improving, and what are you doing about it?", answer: "", section: "HR & behavioral" },
      { id: "career-goals", prompt: "What are your career goals for the next few years?", answer: "", section: "HR & behavioral" },
      { id: "python-dsa", prompt: "Explain a Python or DSA problem you solved, including your approach and complexity.", answer: "", section: "Technical foundations" },
      { id: "sql-dbms", prompt: "Explain how you would use SQL joins and describe one DBMS concept such as normalization or ACID.", answer: "", section: "Technical foundations" },
      { id: "core-cs-networks", prompt: "Explain one OS concept and how a web request travels through a network.", answer: "", section: "Technical foundations" },
      { id: "cyber-cloud", prompt: "Describe a web-security risk and one cloud control that helps reduce it.", answer: "", section: "Cybersecurity & cloud" },
      { id: "password-checker-project", prompt: "Explain your Password Strength Checker, its design choices, tests, and limitations.", answer: "", section: "Project stories" },
      { id: "cloud-monitoring-project", prompt: "Explain your Cloud Security Monitoring System and how it detects or reports security events.", answer: "", section: "Project stories" },
    ],
  });
}

function userIdFor(req: Request): string | null {
  return getAuth(req).userId ?? null;
}

async function readOrCreateWorkspace(userId: string): Promise<WorkspaceState> {
  const record = await prisma.workspaceState.findUnique({ where: { userId } });

  if (record) return GetWorkspaceResponse.parse(record.state);

  const state = createDefaultWorkspace();
  await prisma.workspaceState.upsert({
    where: { userId },
    create: { userId, state: state as object },
    update: {},
  });
  return state;
}

router.get("/workspace", async (req, res): Promise<void> => {
  const userId = userIdFor(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in to access your preparation workspace." });
    return;
  }

  const state = await readOrCreateWorkspace(userId);
  res.json(GetWorkspaceResponse.parse(state));
});

router.put("/workspace", async (req, res): Promise<void> => {
  const userId = userIdFor(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in to save your preparation workspace." });
    return;
  }

  const parsed = SaveWorkspaceBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid workspace state");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const record = await prisma.workspaceState.upsert({
    where: { userId },
    create: { userId, state: parsed.data as object },
    update: { state: parsed.data as object },
  });

  res.json(GetWorkspaceResponse.parse(record.state));
});

router.get("/dashboard", async (req, res): Promise<void> => {
  const userId = userIdFor(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in to view your preparation dashboard." });
    return;
  }

  const state = await readOrCreateWorkspace(userId);
  const completedWeeks = new Set(state.completedWeeks);
  const completedTopics = new Set(state.completedTopics);
  const isWeekComplete = (week: number): boolean => {
    if (
      completedWeeks.has(week) ||
      completedTopics.has(`week-${week}:complete`)
    ) {
      return true;
    }
    const topicCount = TOPIC_COUNTS[week - 1] ?? 0;
    return (
      topicCount > 0 &&
      Array.from({ length: topicCount }, (_, index) =>
        completedTopics.has(`week-${week}:topic-${index + 1}`),
      ).every(Boolean)
    );
  };
  const isWeekTopicComplete = (week: number, index: number): boolean =>
    isWeekComplete(week) ||
    completedTopics.has(`week-${week}:topic-${index + 1}`);
  const totalTopicCount = TOPIC_COUNTS.reduce((sum, count) => sum + count, 0);
  let completedTopicCount = 0;
  TOPIC_COUNTS.forEach((count, index) => {
    for (let topic = 0; topic < count; topic += 1) {
      if (isWeekTopicComplete(index + 1, topic)) completedTopicCount += 1;
    }
  });

  const currentWeek =
    Array.from({ length: 40 }, (_, index) => index + 1).find(
      (week) => !isWeekComplete(week),
    ) ?? 40;
  const completedWeekCount = roadmapWeeks.filter(({ week }) =>
    isWeekComplete(week),
  ).length;
  const currentPhase =
    phases.find(
      (phase) => currentWeek >= phase.range[0] && currentWeek <= phase.range[1],
    )?.name ?? "Interview";
  const categoryRanges = [
    { name: "Python", start: 1, end: 4 },
    { name: "DSA", start: 5, end: 12 },
    { name: "SQL", start: 13, end: 16 },
    { name: "Core CS", start: 17, end: 22 },
    { name: "Cybersecurity", start: 23, end: 26 },
    { name: "Cloud", start: 27, end: 28 },
    { name: "Projects", start: 29, end: 32 },
    { name: "Aptitude", start: 33, end: 36 },
    { name: "Communication", start: 37, end: 40 },
    { name: "Interview", start: 37, end: 40 },
  ];

  const skillProgress = categoryRanges.map(({ name, start, end }) => {
    let planned = 0;
    let done = 0;
    for (let week = start; week <= end; week += 1) {
      planned += TOPIC_COUNTS[week - 1] ?? 0;
      for (let topic = 0; topic < (TOPIC_COUNTS[week - 1] ?? 0); topic += 1) {
        if (isWeekTopicComplete(week, topic)) done += 1;
      }
    }
    return {
      name,
      percentage: planned ? Math.round((done / planned) * 100) : 0,
    };
  });

  const projectIds = new Set([
    "password-strength-checker",
    "cloud-security-monitoring-system",
  ]);
  const projectCounts = new Map<string, number>();
  for (const milestone of state.projectMilestones) {
    if (milestone.completed && projectIds.has(milestone.projectId)) {
      projectCounts.set(
        milestone.projectId,
        (projectCounts.get(milestone.projectId) ?? 0) + 1,
      );
    }
  }
  const projectsCompleted = [...projectIds].filter(
    (projectId) => (projectCounts.get(projectId) ?? 0) >= 4,
  ).length;
  const answered = state.interviewAnswers.filter(
    (answer) => answer.answer.trim().length > 0,
  ).length;

  res.json(
    GetDashboardResponse.parse({
      overallProgress: Math.round((completedTopicCount / totalTopicCount) * 100),
      currentWeek,
      currentPhase,
       completedWeeks: completedWeekCount,
      pendingTasks: state.dailyTasks.filter((task) => !task.completed).length,
      codingSolved: state.codingProblems.filter((problem) => problem.status === "Solved").length,
      sqlSolved: state.sqlEntries.filter((entry) => entry.completed).length,
      projectsCompleted,
      mockTestsCompleted: state.mockTests.length,
      interviewReadiness: Math.round(
        (answered / Math.max(state.interviewAnswers.length, 1)) * 100,
      ),
      certificateStatus: `${state.certificates.filter((certificate) => certificate.completed).length} of ${state.certificates.length} completed`,
      skillProgress,
    }),
  );
});

export default router;