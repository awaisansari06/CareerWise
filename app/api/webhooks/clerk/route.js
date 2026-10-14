import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { db } from '@/lib/prisma';
import { removeUserData } from '@/lib/remove-user-data';

export async function POST(request) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return Response.json({error:'Invalid webhook signature'}, {status:400});
  }
  if (event.type !== 'user.deleted') return Response.json({received:true});
  if (typeof event.data?.id !== 'string' || !event.data.id) {
    return Response.json({error:'Missing user identifier'}, {status:400});
  }
  try {
    await removeUserData(db,event.data.id);
    return Response.json({received:true});
  } catch {
    console.error('[Clerk webhook] Account data deletion failed; delivery must be retried.');
    return Response.json({error:'Please retry delivery'}, {status:503});
  }
}
