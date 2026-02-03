
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'rtrneeldeshpande@gmail.com';
    console.log(`Checking for email: ${email}`);

    // Check Delegate
    const { data: delegates, error: delError } = await supabase
        .from('delegates')
        .select('*')
        .ilike('email', email);

    if (delError) {
        console.error('Delegate Error:', delError);
    } else {
        console.log('Delegate Record:', delegates);
    }

    // Check Travel
    const { data: travel, error: travelError } = await supabase
        .from('travel_details')
        .select('*')
        .ilike('email', email);

    if (travelError) {
        console.error('Travel Error:', travelError);
    } else {
        console.log('Travel Record:', travel);
    }
}

checkUser();
