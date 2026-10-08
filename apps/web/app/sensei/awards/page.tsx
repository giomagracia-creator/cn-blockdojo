"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Named = { id: string; name?: string; title?: string; reward_xp: number };
type Ninja = { id: string; first_name: string };

export default function AwardsPage() {
  const [message, setMessage] = useState("Create a quest, a team, a match, or a badge. Then award it to a Ninja.");
  const [ninjas, setNinjas] = useState<Ninja[]>([]);
  const [quests, setQuests] = useState<Named[]>([]);
  const [teams, setTeams] = useState<Named[]>([]);
  const [badges, setBadges] = useState<Named[]>([]);
  const [questTitle, setQuestTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [matchTitle, setMatchTitle] = useState("");
  const [badgeName, setBadgeName] = useState("");

  async function load() {
    const [people, questRows, teamRows, badgeRows] = await Promise.all([
      browserSupabase().rpc("live_board"),
      browserSupabase().rpc("list_quests"),
      browserSupabase().rpc("list_teams"),
      browserSupabase().rpc("list_achievements"),
    ]);
    setNinjas(Array.isArray(people.data) ? people.data : []);
    setQuests(Array.isArray(questRows.data) ? questRows.data : []);
    setTeams(Array.isArray(teamRows.data) ? teamRows.data : []);
    setBadges(Array.isArray(badgeRows.data) ? badgeRows.data : []);
  }

  useEffect(() => { load(); }, []);

  async function run(name: string, args: Record<string, string | number>) {
    const { data, error } = await browserSupabase().rpc(name, args);
    setMessage(error?.message ?? String(data));
    load();
  }

  return (
    <main>
      <h1>Awards</h1>
      <p>{message}</p>
      <section className="card">
        <h2>Quest</h2>
        <input value={questTitle} onChange={(event) => setQuestTitle(event.target.value)} placeholder="Quest name" />
        <button className="go" type="button" onClick={() => run("create_quest", { title: questTitle, detail: "", reward_xp: 10 })}>Save quest</button>
        {quests.map((quest) => (
          <p key={quest.id}>{quest.title} · {quest.reward_xp} XP
            {ninjas.map((ninja) => (
              <button key={ninja.id} type="button" onClick={() => run("complete_quest", { quest: quest.id, target: ninja.id })}>{ninja.first_name}</button>
            ))}
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Team</h2>
        <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" />
        <button className="go" type="button" onClick={() => run("create_team", { team_name: teamName })}>Save team</button>
        {teams.map((team) => (
          <p key={team.id}>{team.name}
            {ninjas.map((ninja) => (
              <button key={ninja.id} type="button" onClick={() => run("join_team", { team: team.id, target: ninja.id })}>{ninja.first_name}</button>
            ))}
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Match day</h2>
        <input value={matchTitle} onChange={(event) => setMatchTitle(event.target.value)} placeholder="Match name" />
        <button className="go" type="button" onClick={() => run("start_match", { title: matchTitle, minutes: 20 })}>Start 20 minute match</button>
      </section>
      <section className="card">
        <h2>Badge</h2>
        <input value={badgeName} onChange={(event) => setBadgeName(event.target.value)} placeholder="Badge name" />
        <button className="go" type="button" onClick={() => run("create_achievement", { achievement_name: badgeName, detail: "", reward_xp: 5 })}>Save badge</button>
        {badges.map((badge) => (
          <p key={badge.id}>{badge.name} · {badge.reward_xp} XP
            {ninjas.map((ninja) => (
              <button key={ninja.id} type="button" onClick={() => run("award_achievement", { achievement: badge.id, target: ninja.id })}>{ninja.first_name}</button>
            ))}
          </p>
        ))}
      </section>
    </main>
  );
}
