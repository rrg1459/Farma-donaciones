import { createClient } from '../utils/supabase';
import { initials } from '../utils/initials';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <HeaderClient userName="U" userRole="volunteer" />;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const fullName =
    profile?.full_name?.trim() ||
    (typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : '') ||
    'Usuario';

  return (
    <HeaderClient
      userName={initials(fullName) || 'U'}
      userRole={profile?.role || 'volunteer'}
    />
  );
}
