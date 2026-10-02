"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { LIFTS } from "@/lib/lifts";
import { MAX_KEYS, MEET_DATE_KEY, parseMaxKg } from "@/lib/meet";
import { OPL_USERNAME_KEY } from "@/lib/opl";
import { setSetting } from "@/lib/settings";

export async function saveOplUsername(formData: FormData) {
  let username = String(formData.get("username") ?? "").trim();

  // Accept a pasted profile URL like https://www.openpowerlifting.org/u/name
  const fromUrl = username.match(/openpowerlifting\.org\/u\/([^/?#]+)/i);
  if (fromUrl) username = fromUrl[1];
  username = username.toLowerCase();

  await setSetting(OPL_USERNAME_KEY, username);
  updateTag("opl");
  redirect("/settings?saved=1");
}

export async function saveMeetPrep(formData: FormData) {
  const date = String(formData.get("meetDate") ?? "").trim();
  await setSetting(MEET_DATE_KEY, /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "");

  for (const lift of LIFTS) {
    const raw = String(formData.get(`max-${lift}`) ?? "").trim();
    const parsed = parseMaxKg(raw);
    await setSetting(MAX_KEYS[lift], parsed === null ? "" : String(parsed));
  }
  redirect("/settings?saved=meet");
}
