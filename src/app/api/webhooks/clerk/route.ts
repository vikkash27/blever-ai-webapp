import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Your database import here
// import { db } from '@/lib/database';

export async function POST(req: Request) {
  // Get the webhook signing secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET env variable');
    return new NextResponse('Missing webhook secret', { status: 400 });
  }

  // Get the headers - using await since headers() returns a Promise in your environment
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // A new user was created
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    // Get the primary email
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
    
    // Create a new user in your database
    try {
      // Example database call - replace with your own implementation
      // await db.user.create({
      //   data: {
      //     clerkId: id,
      //     email: primaryEmail?.email_address || '',
      //     firstName: first_name || '',
      //     lastName: last_name || '',
      //   },
      // });
      
      console.log(`User created in database for Clerk ID: ${id}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error creating user in database:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }
  }
  
  // Handle organization membership events
  if (eventType === 'organizationMembership.created') {
    // A user was added to an organization
    const { public_user_data, organization } = evt.data;
    
    if (public_user_data && public_user_data.user_id) {
      try {
        // Initialize Clerk client properly
        const clerk = await clerkClient();
        
        // Update user's metadata to indicate they belong to an organization
        await clerk.users.updateUser(public_user_data.user_id, {
          publicMetadata: {
            hasOrganization: true,
            // Store the organization ID for reference
            organizationId: organization.id,
          },
        });
        
        console.log(`User ${public_user_data.user_id} marked as having organization membership`);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error updating user metadata:', error);
        return NextResponse.json({ success: false }, { status: 500 });
      }
    }
  }

  // Handle when a user leaves or is removed from an organization
  if (eventType === 'organizationMembership.deleted') {
    const { public_user_data } = evt.data;
    
    if (public_user_data && public_user_data.user_id) {
      try {
        // Initialize Clerk client properly
        const clerk = await clerkClient();
        
        // Get the user's remaining organization memberships
        const memberships = await clerk.users.getOrganizationMembershipList({
          userId: public_user_data.user_id
        });
        
        // If the user still has other organizations, don't change the flag
        if (memberships.totalCount === 0) {
          // User has no more organizations, update the flag
          await clerk.users.updateUser(public_user_data.user_id, {
            publicMetadata: {
              hasOrganization: false,
              organizationId: null,
            },
          });
          
          console.log(`User ${public_user_data.user_id} marked as having no organization memberships`);
        }
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error updating user metadata for org removal:', error);
        return NextResponse.json({ success: false }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ success: true });
}