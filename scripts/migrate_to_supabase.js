const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://obqdiylmmcbbzjolasmr.supabase.co';
const supabaseAnonKey = 'sb_publishable_XhbE0SsR4lf-cU-vIxzp3w_8QSvP5YF';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    console.log('Starting migration...');

    // Migrate Apartments
    try {
        const apartmentsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'apartments.json'), 'utf8'));
        console.log(`Migrating ${apartmentsData.length} apartments...`);
        const { error: aptError } = await supabase.from('apartments').upsert(
            apartmentsData.map(apt => ({
                name: apt.name,
                floor: apt.floor,
                rooms: apt.rooms,
                area: apt.area,
                price: apt.price,
                status: apt.status,
                description: apt.description,
                images: apt.images || [],
                image_url: apt.imageUrl
            }))
        );
        if (aptError) console.error('Error migrating apartments:', aptError);
        else console.log('Apartments migrated successfully.');
    } catch (e) {
        console.error('Apartments file not found or migration failed:', e.message);
    }

    // Migrate Investments
    try {
        const investmentsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'investments.json'), 'utf8'));
        console.log(`Migrating ${investmentsData.length} investments...`);
        const { error: invError } = await supabase.from('investments').upsert(
            investmentsData.map(inv => ({
                name: inv.name,
                location: inv.location,
                description: inv.description,
                images: inv.images || []
            }))
        );
        if (invError) console.error('Error migrating investments:', invError);
        else console.log('Investments migrated successfully.');
    } catch (e) {
        console.error('Investments file not found or migration failed:', e.message);
    }

    // Migrate News
    try {
        const newsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'news.json'), 'utf8'));
        console.log(`Migrating ${newsData.length} news items...`);
        const { error: newsError } = await supabase.from('news').upsert(
            newsData.map(item => ({
                title: item.title,
                date: item.date,
                content: item.content,
                image: item.image
            }))
        );
        if (newsError) console.error('Error migrating news:', newsError);
        else console.log('News migrated successfully.');
    } catch (e) {
        console.error('News file not found or migration failed:', e.message);
    }

    console.log('Migration finished.');
}

migrate();
