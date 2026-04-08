import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/alex_backend/alex_backend.did";

const impressions = new Set<string>();
const views = new Set<string>();

export const trackImpression = (id: string) => {
	impressions.add(id);
};

export const trackView = (id: string) => {
	views.add(id);
};

export const flushEngagement = async (actor: ActorSubclass<_SERVICE>) => {
	if (impressions.size === 0 && views.size === 0) return;

	const impressionIds = Array.from(impressions);
	const viewIds = Array.from(views);

	// Clear immediately to avoid double-sending
	impressions.clear();
	views.clear();

	try {
		await actor.record_engagement_batch(impressionIds, viewIds);
	} catch (e) {
		console.error("Failed to flush engagement:", e);
	}
};
