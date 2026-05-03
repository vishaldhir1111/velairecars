import { conciergeKnowledge } from "./_lib/fleet-data.js";
import { allowMethods, readJson, sendJson } from "./_lib/http.js";

function money(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function scoreVehicle(vehicle, prompt) {
  const lower = prompt.toLowerCase();
  let score = 0;

  if (vehicle.slug === "lamborghini-urus" && /(impact|presence|flex|vip|content|event|impress|exclusive)/.test(lower)) {
    score += 10;
  }
  if (vehicle.slug === "range-rover-sport-svr" && /(family|luggage|airport|practical|suv|comfort|svr)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "tesla-model-3-performance" && /(electric|quiet|business|executive|clean|city|modern)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "bmw-m440i-convertible" && /(wedding|summer|convertible|open|date|weekend)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "bmw-m140i-shadow-edition" && /(compact|subtle|driver|fun|sporty|value)/.test(lower)) {
    score += 8;
  }

  const haystack = [
    vehicle.name,
    vehicle.bodyType,
    vehicle.colour,
    vehicle.personality,
    vehicle.idealCustomer,
    ...vehicle.bestUseCases,
    ...vehicle.keySellingPoints,
  ]
    .join(" ")
    .toLowerCase();

  lower
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .forEach((token) => {
      if (haystack.includes(token)) score += 1;
    });

  return score;
}

function recommend(prompt) {
  const ranked = [...conciergeKnowledge].sort((a, b) => scoreVehicle(b, prompt) - scoreVehicle(a, prompt));
  const pick = ranked[0];
  const alternative = ranked[1];
  return {
    recommendedVehicle: pick.slug,
    alternatives: ranked.slice(1, 3).map((vehicle) => vehicle.slug),
    response: `${pick.name} ${pick.year} is the strongest Velaire recommendation. ${pick.personality} It suits ${pick.bestUseCases
      .slice(0, 4)
      .join(", ")} and starts from ${money(pick.priceReference)}/day. A strong alternative is ${alternative.name} if you want ${alternative.personality.toLowerCase()} ${pick.upsellAngle}`,
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const body = await readJson(req);
  const prompt = body.prompt || body.question || "";
  if (!prompt.trim()) {
    sendJson(res, 400, { error: "missing_prompt", message: "Ask the Velaire concierge a fleet question." });
    return;
  }

  sendJson(res, 200, {
    mode: "rule-based-fleet-concierge",
    ...recommend(prompt),
  });
}
