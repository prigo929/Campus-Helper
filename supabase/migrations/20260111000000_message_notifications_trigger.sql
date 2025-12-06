-- Insert notifications for message recipients automatically
-- Uses a SECURITY DEFINER function to bypass RLS on notifications

create or replace function public.handle_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
  sender_name text;
  preview text;
begin
  select coalesce(full_name, email, 'Someone')
    into sender_name
    from profiles
    where id = new.sender_id;

  preview := left(coalesce(new.body, ''), 140);

  for recipient in
    select cp.user_id
    from conversation_participants cp
    where cp.conversation_id = new.conversation_id
      and cp.user_id <> new.sender_id
  loop
    insert into notifications (user_id, type, title, body, metadata, read)
    values (
      recipient,
      'message',
      'New message',
      sender_name || ': ' || preview,
      jsonb_build_object(
        'conversation_id', new.conversation_id,
        'sender_id', new.sender_id,
        'message_id', new.id
      ),
      false
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_message_notifications on messages;

create trigger trg_message_notifications
after insert on messages
for each row execute function public.handle_message_notification();
