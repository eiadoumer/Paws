// Fictional Phase 1 data. Keep these seeds unchanged; edit a createMockData() copy.
// Roles, regions and enum values match constants.js. Ages are always whole months.
// Images live in /public/images (paths are case-sensitive once deployed).
export const DEMO_USER_ID = 'user-001';
export const DEMO_PASSWORD = 'PawsDemo123!';

const SHELTER_IMAGE = '/images/shelters/Animal-shelter.jpg';

export const mockUsers = [
  { id: 'user-001', name: 'Alex Morgan', email: 'alex@example.com', password: DEMO_PASSWORD, role: 'adopter', shelterId: null, region: 'mount-lebanon', phone: '+961 70 555 101', bio: 'I foster pets and am looking for a companion for my family.', createdAt: '2026-09-01T09:00:00Z' },
  { id: 'user-002', name: 'Sam Rivera', email: 'sam@example.com', password: DEMO_PASSWORD, role: 'adopter', shelterId: null, region: 'beqaa', phone: '+961 70 555 102', bio: 'An experienced dog owner with a quiet home and a fenced garden.', createdAt: '2026-09-03T10:00:00Z' },
  { id: 'user-003', name: 'Taylor Reed', email: 'taylor@example.com', password: DEMO_PASSWORD, role: 'adopter', shelterId: null, region: 'mount-lebanon', phone: '+961 70 555 103', bio: 'A cat lover who also helps small animals find homes.', createdAt: '2026-09-05T11:00:00Z' },
  { id: 'user-004', name: 'Jordan Lee', email: 'central@example.com', password: DEMO_PASSWORD, role: 'shelter', shelterId: 'shelter-001', region: 'beirut', phone: '+961 1 555 104', bio: 'Adoption coordinator at Central Paws Rescue.', createdAt: '2026-09-02T08:00:00Z' },
  { id: 'user-005', name: 'Casey Brooks', email: 'casey@example.com', password: DEMO_PASSWORD, role: 'adopter', shelterId: null, region: 'beirut', phone: '+961 70 555 105', bio: 'New to adoption and interested in a gentle small companion.', createdAt: '2026-11-01T12:00:00Z' },
  { id: 'user-006', name: 'Jamie Park', email: 'north@example.com', password: DEMO_PASSWORD, role: 'shelter', shelterId: 'shelter-002', region: 'north', phone: '+961 6 555 106', bio: 'Adoption coordinator at North Meadow Shelter.', createdAt: '2026-09-04T08:00:00Z' },
  { id: 'user-007', name: 'Robin Ellis', email: 'south@example.com', password: DEMO_PASSWORD, role: 'shelter', shelterId: 'shelter-003', region: 'south', phone: '+961 7 555 107', bio: 'Adoption coordinator at Sunny Tails Haven.', createdAt: '2026-09-06T08:00:00Z' },
  { id: 'user-008', name: 'Drew Quinn', email: 'drew@example.com', password: DEMO_PASSWORD, role: 'adopter', shelterId: null, region: 'south', phone: '+961 70 555 108', bio: 'A new account with no listings or adoption requests yet.', createdAt: '2026-11-08T09:00:00Z' },
];

export const mockShelters = [
  {
    id: 'shelter-001', name: 'Central Paws Rescue', ownerId: 'user-004', region: 'beirut',
    address: '12 Kindness Street, Hamra, Beirut', email: 'central@example.com', phone: '+961 1 555 104',
    description: 'A community rescue helping dogs, cats, birds, and small companions find suitable homes. Our team offers introductions and guidance for first-time adopters.',
    openingHours: ['Monday–Friday: 10:00–17:00', 'Saturday: 10:00–14:00', 'Sunday: Closed'],
    adoptionPolicy: 'Send a request through the pet details page. We will arrange a conversation and a meeting before confirming an adoption.',
    imageUrl: SHELTER_IMAGE, imageAlt: 'Central Paws Rescue animal shelter', establishedYear: 2018,
  },
  {
    id: 'shelter-002', name: 'North Meadow Shelter', ownerId: 'user-006', region: 'north',
    address: '8 Meadow Road, Tripoli', email: 'north@example.com', phone: '+961 6 555 106',
    description: 'A small shelter with space for active dogs and quiet rooms for cats and rabbits. We help each adopter understand their new companion’s daily needs.',
    openingHours: ['Tuesday–Friday: 09:00–16:00', 'Saturday–Sunday: 10:00–15:00', 'Monday: Closed'],
    adoptionPolicy: 'Submit an adoption request and tell us about your household. Meetings are by appointment so every animal has a calm introduction.',
    imageUrl: SHELTER_IMAGE, imageAlt: 'North Meadow Shelter animal shelter', establishedYear: 2020,
  },
  {
    id: 'shelter-003', name: 'Sunny Tails Haven', ownerId: 'user-007', region: 'south',
    address: '25 Sunshine Avenue, Sidon', email: 'south@example.com', phone: '+961 7 555 107',
    description: 'A volunteer-run haven caring for pets of different ages, including senior animals and companions that need a little extra patience.',
    openingHours: ['Monday–Saturday: 10:00–16:00', 'Sunday: By appointment'],
    adoptionPolicy: 'Start with an adoption request. Our volunteers will discuss care requirements and arrange a visit before an adoption is approved.',
    imageUrl: SHELTER_IMAGE, imageAlt: 'Sunny Tails Haven animal shelter', establishedYear: 2016,
  },
];

export const mockPets = [
  {
    id: 'pet-001', name: 'Maple', species: 'dog', breed: 'Mixed breed', ageMonths: 24, sex: 'female', size: 'medium', region: 'mount-lebanon',
    ownerId: 'user-001', shelterId: null, status: 'available', isFeatured: true,
    description: 'Maple is an affectionate walking companion who enjoys sniffing trails and relaxing beside her people. She knows sit and is continuing her lead training.',
    traits: ['Affectionate', 'Playful', 'Enjoys walks'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. No ongoing treatment reported.', adoptionNotes: 'Would suit a home that can offer daily walks and gradual introductions to other pets.',
    imageUrl: '/images/pets/Dog1.jpg', imageAlt: 'Maple, a mixed breed dog', createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'pet-002', name: 'Luna', species: 'cat', breed: 'Domestic shorthair', ageMonths: 18, sex: 'female', size: 'small', region: 'mount-lebanon',
    ownerId: 'user-001', shelterId: null, status: 'adopted', isFeatured: false,
    description: 'Luna likes sunny windows, feather toys, and a quiet lap. After a short settling-in period, she becomes a confident and affectionate companion.',
    traits: ['Gentle', 'Quiet', 'Litter trained'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. No ongoing treatment reported.', adoptionNotes: 'Her adoption has been completed. This listing remains visible as a past adoption.',
    imageUrl: '/images/pets/Cat1.jpg', imageAlt: 'Luna, a domestic shorthair cat', createdAt: '2026-10-02T10:00:00Z', updatedAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'pet-003', name: 'Clover', species: 'rabbit', breed: 'Mini lop mix', ageMonths: 9, sex: 'male', size: 'small', region: 'mount-lebanon',
    ownerId: 'user-001', shelterId: null, status: 'pending', isFeatured: false,
    description: 'Clover is a curious rabbit who enjoys cardboard tunnels and exploring a safe indoor space. He appreciates gentle handling and a predictable routine.',
    traits: ['Curious', 'Gentle', 'Indoor companion'], vaccinated: true, neutered: true,
    healthNotes: 'Rabbit vet check completed. Requires a suitable hay-based diet and regular dental checks.', adoptionNotes: 'A meeting is being arranged with a potential adopter.',
    imageUrl: '/images/pets/Rabbit1.jpg', imageAlt: 'Clover, a mini lop mix rabbit', createdAt: '2026-10-03T10:00:00Z', updatedAt: '2026-11-05T12:00:00Z',
  },
  {
    id: 'pet-004', name: 'Bruno', species: 'dog', breed: 'Labrador mix', ageMonths: 48, sex: 'male', size: 'large', region: 'beirut',
    ownerId: 'user-004', shelterId: 'shelter-001', status: 'pending', isFeatured: false,
    description: 'Bruno is an enthusiastic dog who enjoys outdoor games and learning new cues. He would love a household with time for exercise and reward-based training.',
    traits: ['Energetic', 'Sociable', 'Food motivated'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. No ongoing treatment reported.', adoptionNotes: 'An introductory visit is being arranged. Adoption is not yet confirmed.',
    imageUrl: '/images/pets/Dog2.jpg', imageAlt: 'Bruno, a Labrador mix dog', createdAt: '2026-10-04T10:00:00Z', updatedAt: '2026-11-04T12:00:00Z',
  },
  {
    id: 'pet-005', name: 'Milo', species: 'cat', breed: 'Domestic longhair', ageMonths: 36, sex: 'male', size: 'medium', region: 'north',
    ownerId: 'user-006', shelterId: 'shelter-002', status: 'adopted', isFeatured: false,
    description: 'Milo is a calm cat who enjoys being brushed and watching the world from a perch. He has found his new home through the adoption network.',
    traits: ['Calm', 'Affectionate', 'Litter trained'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. His long coat benefits from regular brushing.', adoptionNotes: 'Adopted. The original lister keeps this record for their dashboard history.',
    imageUrl: '/images/pets/Cat2.jpg', imageAlt: 'Milo, a domestic longhair cat', createdAt: '2026-10-05T10:00:00Z', updatedAt: '2026-11-03T12:00:00Z',
  },
  {
    id: 'pet-006', name: 'Pip', species: 'bird', breed: 'Budgerigar', ageMonths: 14, sex: 'male', size: 'small', region: 'beirut',
    ownerId: 'user-004', shelterId: 'shelter-001', status: 'available', isFeatured: true,
    description: 'Pip is a lively budgie who enjoys foraging toys and chirping along with the household. He needs a spacious enclosure and safe supervised time outside it.',
    traits: ['Vocal', 'Curious', 'Social'], vaccinated: false, neutered: false,
    healthNotes: 'Avian vet check completed. Vaccination and neutering are not part of his current care plan.', adoptionNotes: 'Best suited to someone ready to provide daily enrichment and species-appropriate companionship.',
    imageUrl: '/images/pets/Bird1.jpg', imageAlt: 'Pip, a budgerigar', createdAt: '2026-10-06T10:00:00Z', updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'pet-007', name: 'Willow', species: 'rabbit', breed: 'Domestic rabbit', ageMonths: 30, sex: 'female', size: 'medium', region: 'beirut',
    ownerId: 'user-004', shelterId: 'shelter-001', status: 'available', isFeatured: true,
    description: 'Willow enjoys exploring, tossing willow balls, and resting under a low table. She prefers to approach people in her own time rather than being picked up.',
    traits: ['Independent', 'Curious', 'Litter trained'], vaccinated: true, neutered: true,
    healthNotes: 'Rabbit vet check completed. No ongoing treatment reported.', adoptionNotes: 'Needs a spacious rabbit-safe living area and a plan for appropriate companionship.',
    imageUrl: '/images/pets/Rabbit2.jpg', imageAlt: 'Willow, a domestic rabbit', createdAt: '2026-10-07T10:00:00Z', updatedAt: '2026-10-07T10:00:00Z',
  },
  {
    id: 'pet-009', name: 'Peanut', species: 'dog', breed: 'Terrier mix', ageMonths: 5, sex: 'male', size: 'small', region: 'beirut',
    ownerId: 'user-004', shelterId: 'shelter-001', status: 'available', isFeatured: false,
    description: 'Peanut is a young puppy with plenty to learn and lots of enthusiasm. He loves short play sessions, naps, and exploring new smells.',
    traits: ['Playful', 'Young', 'Learning house training'], vaccinated: false, neutered: false,
    healthNotes: 'Puppy vaccination course is in progress. Follow-up veterinary visits are needed.', adoptionNotes: 'Needs a patient home with time for puppy training. His adult size is not guaranteed by the current size label.',
    imageUrl: '/images/pets/Dog1.jpg', imageAlt: 'Peanut, a terrier mix puppy', createdAt: '2026-10-09T10:00:00Z', updatedAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'pet-010', name: 'Nala', species: 'cat', breed: 'Domestic shorthair', ageMonths: 84, sex: 'female', size: 'medium', region: 'north',
    ownerId: 'user-006', shelterId: 'shelter-002', status: 'available', isFeatured: true,
    description: 'Nala is a relaxed senior cat who appreciates warm blankets and a peaceful routine. She enjoys company without needing constant attention.',
    traits: ['Senior', 'Calm', 'Litter trained'], vaccinated: true, neutered: true,
    healthNotes: 'Recent vet check completed. Discuss ongoing senior wellness visits with a veterinarian.', adoptionNotes: 'A quiet indoor home with comfortable resting places would suit her well.',
    imageUrl: '/images/pets/Cat1.jpg', imageAlt: 'Nala, a domestic shorthair cat', createdAt: '2026-10-10T10:00:00Z', updatedAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'pet-011', name: 'Scout', species: 'dog', breed: 'Shepherd mix', ageMonths: 20, sex: 'male', size: 'large', region: 'north',
    ownerId: 'user-006', shelterId: 'shelter-002', status: 'available', isFeatured: false,
    description: 'Scout is a bright young dog who likes puzzle feeders and learning new skills. He benefits from a calm approach when meeting unfamiliar people.',
    traits: ['Intelligent', 'Active', 'Enjoys training'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. No ongoing treatment reported.', adoptionNotes: 'An adopter willing to continue gentle training and provide daily activity is preferred.',
    imageUrl: '/images/pets/Dog2.jpg', imageAlt: 'Scout, a shepherd mix dog', createdAt: '2026-10-11T10:00:00Z', updatedAt: '2026-10-11T10:00:00Z',
  },
  {
    id: 'pet-012', name: 'Hazel', species: 'rabbit', breed: 'Rex mix', ageMonths: 4, sex: 'female', size: 'small', region: 'north',
    ownerId: 'user-006', shelterId: 'shelter-002', status: 'available', isFeatured: false,
    description: 'Hazel is a young rabbit learning to trust people. She likes to investigate a room at floor level and enjoys finding her food in enrichment toys.',
    traits: ['Young', 'Shy at first', 'Curious'], vaccinated: false, neutered: false,
    healthNotes: 'Initial vet visit completed. Follow-up vaccination and neutering advice will be provided by the vet.', adoptionNotes: 'Needs patient handling, a rabbit-safe space, and follow-up veterinary care.',
    imageUrl: '/images/pets/Rabbit3.jpg', imageAlt: 'Hazel, a rex mix rabbit', createdAt: '2026-10-12T10:00:00Z', updatedAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'pet-013', name: 'Sunny', species: 'bird', breed: 'Cockatiel', ageMonths: 36, sex: 'male', size: 'small', region: 'south',
    ownerId: 'user-007', shelterId: 'shelter-003', status: 'available', isFeatured: false,
    description: 'Sunny likes to whistle and investigate new perches. He needs a patient adopter who will let him build confidence at his own pace.',
    traits: ['Musical', 'Social', 'Curious'], vaccinated: false, neutered: false,
    healthNotes: 'Avian vet check completed. Vaccination and neutering are not part of his current care plan.', adoptionNotes: 'Requires a bird-safe home, daily enrichment, and suitable companionship.',
    imageUrl: '/images/pets/Bird2.jpg', imageAlt: 'Sunny, a cockatiel', createdAt: '2026-10-13T10:00:00Z', updatedAt: '2026-10-13T10:00:00Z',
  },
  {
    id: 'pet-014', name: 'Teddy', species: 'dog', breed: 'Retriever mix', ageMonths: 108, sex: 'male', size: 'large', region: 'south',
    ownerId: 'user-007', shelterId: 'shelter-003', status: 'available', isFeatured: true,
    description: 'Teddy is a gentle senior who enjoys short sniffing walks and comfortable naps. He is happiest spending time close to his people.',
    traits: ['Senior', 'Gentle', 'Calm'], vaccinated: true, neutered: true,
    healthNotes: 'Mild joint stiffness is managed with a vet-approved care plan. Details are available from the shelter.', adoptionNotes: 'A home with easy access and a relaxed routine would suit him well.',
    imageUrl: '/images/pets/Dog1.jpg', imageAlt: 'Teddy, a retriever mix dog', createdAt: '2026-10-14T10:00:00Z', updatedAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'pet-015', name: 'Pepper', species: 'cat', breed: 'Domestic shorthair', ageMonths: 3, sex: 'female', size: 'small', region: 'south',
    ownerId: 'user-007', shelterId: 'shelter-003', status: 'available', isFeatured: false,
    description: 'Pepper is an energetic kitten who loves chasing toys and climbing. She needs a safe indoor environment and plenty of appropriate play.',
    traits: ['Young', 'Playful', 'Litter trained'], vaccinated: false, neutered: false,
    healthNotes: 'Kitten vaccination course is in progress. Follow-up visits and neutering advice are needed.', adoptionNotes: 'Her adopter should be prepared for kitten care and supervised introductions to other animals.',
    imageUrl: '/images/pets/Cat2.jpg', imageAlt: 'Pepper, a domestic shorthair kitten', createdAt: '2026-10-15T10:00:00Z', updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'pet-017', name: 'Ziggy', species: 'dog', breed: 'Mixed breed', ageMonths: 60, sex: 'male', size: 'medium', region: 'beqaa',
    ownerId: 'user-002', shelterId: null, status: 'available', isFeatured: false,
    description: 'Ziggy enjoys long walks and a game of fetch. His current family is helping him find a home that can give him the time and activity he needs.',
    traits: ['Active', 'Friendly', 'House trained'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. No ongoing treatment reported.', adoptionNotes: 'His individual lister can arrange a meeting and discuss his usual routine.',
    imageUrl: '/images/pets/Dog2.jpg', imageAlt: 'Ziggy, a mixed breed dog', createdAt: '2026-10-17T10:00:00Z', updatedAt: '2026-10-17T10:00:00Z',
  },
  {
    id: 'pet-018', name: 'Misty', species: 'cat', breed: 'Domestic shorthair', ageMonths: 42, sex: 'female', size: 'medium', region: 'mount-lebanon',
    ownerId: 'user-003', shelterId: null, status: 'available', isFeatured: false,
    description: 'Misty takes time to settle but enjoys quiet company and chasing soft toys. Her foster carer is looking for a patient household with a predictable routine.',
    traits: ['Quiet', 'Shy at first', 'Litter trained'], vaccinated: true, neutered: true,
    healthNotes: 'Routine vet check completed. No ongoing treatment reported.', adoptionNotes: 'A calm indoor home and slow introductions would help her settle.',
    imageUrl: '/images/pets/Cat1.jpg', imageAlt: 'Misty, a domestic shorthair cat', createdAt: '2026-10-18T10:00:00Z', updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'pet-019', name: 'Leo', species: 'other', breed: 'African lion', ageMonths: 72, sex: 'male', size: 'large', region: 'south',
    ownerId: 'user-007', shelterId: 'shelter-003', status: 'available', isFeatured: true,
    description: 'Leo is a calm, majestic lion who enjoys basking in the sun and long afternoon naps. He was rescued from an unsuitable private enclosure and is now in specialist care.',
    traits: ['Calm', 'Majestic', 'Needs specialist care'], vaccinated: true, neutered: true,
    healthNotes: 'Wildlife vet check completed. Needs a large secure enclosure and a specialist diet.', adoptionNotes: 'Placement only with a licensed wildlife sanctuary. The shelter will review every request carefully.',
    imageUrl: '/images/pets/Lion1.jpg', imageAlt: 'Leo, an African lion', createdAt: '2026-10-19T10:00:00Z', updatedAt: '2026-10-19T10:00:00Z',
  },
  {
    id: 'pet-020', name: 'Kiwi', species: 'bird', breed: 'Lovebird', ageMonths: 18, sex: 'female', size: 'small', region: 'north',
    ownerId: 'user-006', shelterId: 'shelter-002', status: 'available', isFeatured: false,
    description: 'Kiwi is a cheerful lovebird who enjoys shredding paper toys and chattering in the morning. She bonds closely with people who spend time with her every day.',
    traits: ['Cheerful', 'Vocal', 'Affectionate'], vaccinated: false, neutered: false,
    healthNotes: 'Avian vet check completed. Vaccination and neutering are not part of her current care plan.', adoptionNotes: 'Best suited to a home that can offer daily attention and a spacious cage with plenty of toys.',
    imageUrl: '/images/pets/Bird3.jpg', imageAlt: 'Kiwi, a lovebird', createdAt: '2026-10-20T10:00:00Z', updatedAt: '2026-10-20T10:00:00Z',
  },
];

export const mockAdoptionRequests = [
  { id: 'request-001', petId: 'pet-001', adopterId: 'user-002', status: 'pending', message: 'I have a fenced garden and would love to meet Maple. I can provide daily walks and continue her training.', createdAt: '2026-11-01T09:00:00Z', updatedAt: '2026-11-01T09:00:00Z' },
  { id: 'request-002', petId: 'pet-001', adopterId: 'user-003', status: 'pending', message: 'Could we arrange a meeting to see how Maple settles around my household?', createdAt: '2026-11-02T09:00:00Z', updatedAt: '2026-11-02T09:00:00Z' },
  { id: 'request-003', petId: 'pet-002', adopterId: 'user-003', status: 'approved', message: 'I can offer Luna a quiet indoor home and regular veterinary care.', createdAt: '2026-10-25T10:00:00Z', updatedAt: '2026-11-02T10:00:00Z' },
  { id: 'request-004', petId: 'pet-002', adopterId: 'user-002', status: 'rejected', message: 'I would like to learn more about adopting Luna and her daily routine.', createdAt: '2026-10-26T10:00:00Z', updatedAt: '2026-11-02T10:00:00Z' },
  { id: 'request-005', petId: 'pet-003', adopterId: 'user-005', status: 'pending', message: 'I have prepared an indoor rabbit space and would like to discuss Clover’s care needs.', createdAt: '2026-11-04T10:00:00Z', updatedAt: '2026-11-05T12:00:00Z' },
  { id: 'request-006', petId: 'pet-003', adopterId: 'user-003', status: 'rejected', message: 'I am interested in Clover and would like advice about a suitable setup.', createdAt: '2026-11-03T10:00:00Z', updatedAt: '2026-11-04T10:00:00Z' },
  { id: 'request-007', petId: 'pet-004', adopterId: 'user-001', status: 'pending', message: 'Our family enjoys daily walks. We would love to meet Bruno and talk about his training.', createdAt: '2026-11-03T12:00:00Z', updatedAt: '2026-11-04T12:00:00Z' },
  { id: 'request-008', petId: 'pet-005', adopterId: 'user-001', status: 'approved', message: 'I can offer Milo a quiet home and keep up with his grooming routine.', createdAt: '2026-10-28T12:00:00Z', updatedAt: '2026-11-03T12:00:00Z' },
  { id: 'request-009', petId: 'pet-006', adopterId: 'user-001', status: 'rejected', message: 'I am interested in Pip and would like to discuss the space and daily care he needs.', createdAt: '2026-10-29T12:00:00Z', updatedAt: '2026-10-31T12:00:00Z' },
  { id: 'request-010', petId: 'pet-007', adopterId: 'user-001', status: 'pending', message: 'I can provide a spacious indoor rabbit area and would like to meet Willow.', createdAt: '2026-11-06T12:00:00Z', updatedAt: '2026-11-06T12:00:00Z' },
  { id: 'request-011', petId: 'pet-005', adopterId: 'user-002', status: 'rejected', message: 'Could you tell me more about Milo and arrange an introduction?', createdAt: '2026-10-29T10:00:00Z', updatedAt: '2026-11-03T12:00:00Z' },
  { id: 'request-012', petId: 'pet-017', adopterId: 'user-005', status: 'pending', message: 'I would like to meet Ziggy and discuss whether my daily routine would be a good fit.', createdAt: '2026-11-07T10:00:00Z', updatedAt: '2026-11-07T10:00:00Z' },
];

// One fresh copy per app session; share it through one provider above all routes.
// A logged-out start lets Login/Register be demonstrated. For a dashboard-only
// preview, set the returned currentUserId to DEMO_USER_ID in your provider.
export function createMockData() {
  return structuredClone({
    users: mockUsers,
    shelters: mockShelters,
    pets: mockPets,
    adoptionRequests: mockAdoptionRequests,
    currentUserId: null,
  });
}
