const GITHUB_GRAPHQL = "https://api.github.com/graphql";

const STATS_QUERY = `
query ($login: String!) {
  user(login: $login) {
    name
    login
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      totalCount
      nodes { stargazerCount }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
      contributionCalendar { totalContributions }
    }
  }
}`;

const ACTIVITY_QUERY = `
query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

const LANGS_QUERY = `
query ($login: String!, $after: String) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false) {
      pageInfo { hasNextPage endCursor }
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
        }
      }
    }
  }
}`;

async function ghGraphQL(query, variables) {
  const token = process.env.GH_TOKEN;
  if (!token) {
    throw new Error("Missing GH_TOKEN environment variable on the deployment");
  }
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "self-hosted-github-stats-card",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

export async function fetchStats(login) {
  const data = await ghGraphQL(STATS_QUERY, { login });
  const user = data.user;
  const totalStars = user.repositories.nodes.reduce(
    (sum, r) => sum + r.stargazerCount,
    0
  );
  const c = user.contributionsCollection;
  return {
    name: user.name || user.login,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    totalStars,
    totalCommits: c.totalCommitContributions,
    totalPRs: c.totalPullRequestContributions,
    totalIssues: c.totalIssueContributions,
    contributionsThisYear: c.contributionCalendar.totalContributions,
  };
}

export async function fetchActivity(login) {
  const data = await ghGraphQL(ACTIVITY_QUERY, { login });
  const calendar = data.user.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks.map((week) => {
    const total = week.contributionDays.reduce(
      (sum, day) => sum + day.contributionCount,
      0
    );
    return {
      weekStart: week.contributionDays[0]?.date,
      total,
    };
  });
  return {
    totalContributions: calendar.totalContributions,
    weeks,
  };
}

export async function fetchTopLanguages(login, limit = 6) {
  const totals = new Map(); // name -> { size, color }
  let after = null;
  let hasNextPage = true;
  let pages = 0;

  while (hasNextPage && pages < 5) {
    const data = await ghGraphQL(LANGS_QUERY, { login, after });
    const repos = data.user.repositories;
    for (const repo of repos.nodes) {
      for (const edge of repo.languages.edges) {
        const key = edge.node.name;
        const prev = totals.get(key) || { size: 0, color: edge.node.color || "#8b8b8b" };
        prev.size += edge.size;
        totals.set(key, prev);
      }
    }
    hasNextPage = repos.pageInfo.hasNextPage;
    after = repos.pageInfo.endCursor;
    pages += 1;
  }

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, limit);
  const total = sorted.reduce((sum, [, v]) => sum + v.size, 0) || 1;

  return sorted.map(([name, v]) => ({
    name,
    color: v.color,
    percent: (v.size / total) * 100,
  }));
}
