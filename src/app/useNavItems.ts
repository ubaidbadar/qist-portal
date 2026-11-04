import { useCan } from '../auth';
import { NAV_ITEMS } from './nav_items';

/** The navigation the signed-in user's role may use. */
export default function useNavItems() {
  const can = useCan();
  return NAV_ITEMS.filter((item) => !item.comingSoon && (!item.permission || can(item.permission)));
}
