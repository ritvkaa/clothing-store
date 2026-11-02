import { getStoreSettings } from "@/lib/store-settings";

export default async function StoreName() {
  const settings = await getStoreSettings();
  return settings.storeName;
}
