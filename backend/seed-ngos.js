/**
 * Seed NGOs
 * Creates sample NGO records in the database
 */

require('dotenv').config();
const { NGO, User } = require('./database/models');
const bcrypt = require('bcryptjs');

async function seedNGOs() {
  try {
    console.log('🌱 Seeding NGOs...\n');

    // Check if NGOs already exist
    const existingCount = await NGO.count();
    if (existingCount >= 3) {
      console.log(`✅ Already have ${existingCount} NGOs in database.\n`);
      return;
    }

    // Create NGO users first
    const ngoUsers = [
      {
        email: 'contact@helpfoundation.org',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Help Foundation',
        phone: '03001234567',
        role: 'ngo',
        is_verified: true
      },
      {
        email: 'info@greenpakistan.org',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Green Pakistan',
        phone: '03001234568',
        role: 'ngo',
        is_verified: true
      },
      {
        email: 'contact@healthcarefoundation.org',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Health Care Foundation',
        phone: '03001234569',
        role: 'ngo',
        is_verified: true
      }
    ];

    const createdUsers = [];
    for (const userData of ngoUsers) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        createdUsers.push(existing);
      } else {
        const user = await User.create(userData);
        createdUsers.push(user);
      }
    }

    console.log(`✅ Created/Found ${createdUsers.length} NGO users\n`);

    // Create NGO records
    const ngosToCreate = [
      {
        user_id: createdUsers[0].id,
        ngo_name: 'Help Foundation',
        registration_number: 'NGO-2020-001',
        description: 'Supporting underprivileged children with education and healthcare',
        address: 'House 123, Street 5, F-7, Islamabad',
        website: 'https://helpfoundation.org',
        verification_status: 'approved',
        verified_at: new Date()
      },
      {
        user_id: createdUsers[1].id,
        ngo_name: 'Green Pakistan',
        registration_number: 'NGO-2019-045',
        description: 'Environmental conservation and tree plantation NGO',
        address: 'Plot 456, Block B, Gulshan-e-Iqbal, Karachi',
        website: 'https://greenpakistan.org',
        verification_status: 'approved',
        verified_at: new Date()
      },
      {
        user_id: createdUsers[2].id,
        ngo_name: 'Health Care Foundation',
        registration_number: 'NGO-2021-089',
        description: 'Medical assistance and health awareness programs',
        address: 'Building 789, Main Boulevard, Johar Town, Lahore',
        website: 'https://healthcarefoundation.org',
        verification_status: 'approved',
        verified_at: new Date()
      }
    ];

    const createdNGOs = [];
    for (const ngoData of ngosToCreate) {
      const existing = await NGO.findOne({ where: { user_id: ngoData.user_id } });
      if (existing) {
        createdNGOs.push(existing);
      } else {
        const ngo = await NGO.create(ngoData);
        createdNGOs.push(ngo);
      }
    }

    console.log(`✅ Created ${createdNGOs.length} NGOs!\n`);

    // Display created NGOs
    createdNGOs.forEach((ngo, index) => {
      console.log(`${index + 1}. ${ngo.ngo_name}`);
      console.log(`   📍 ${ngo.address}`);
      console.log(`   ✓ ${ngo.verification_status}\n`);
    });

    console.log('✅ NGOs seeded successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding NGOs:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

seedNGOs();
