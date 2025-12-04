import HubHero from "../../../components/hub/HubHero";
import CollectionCard from "../../../components/hub/CollectionCard";
import { getHub } from "../../../lib/api/hub";

export default async function PublicHubPage({ params }) {
  const hub = await getHub(params.username);
  if (!hub) {
    return (
      <div className="card p-6">
        <p className="text-sm text-zinc-300">Hub not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HubHero
        title={`${hub.user.name}'s Hub`}
        tagline="Curated collections and featured work."
        subtle={`Portfolio mode for @${hub.user.username}`}
      />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {hub.collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
