import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useUnreadMessages() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let interval;
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setUnread(0); return; }
        const uid = session.user.id;
        const { data: convs } = await supabase
          .from("conversations")
          .select("id")
          .or(`participant_1.eq.${uid},participant_2.eq.${uid}`);
        if (!convs?.length) { setUnread(0); return; }
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("read", false)
          .neq("sender_id", uid)
          .in("conversation_id", convs.map(c => c.id));
        setUnread(count || 0);
      } catch {}
    };
    check();
    interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return unread;
}
