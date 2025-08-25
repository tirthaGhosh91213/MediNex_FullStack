import doctor_group from "./doctor_group.png";
import singleDoctorRemovebg from "./sigle_doctor-removebg.png";
import doctor1 from "./doc1.png"
import doc2 from "./doc2.png"
import doc3 from "./doc3.png"

export const assets = {
  doctor_group,
  singleDoctorRemovebg,
};
export const specialityData = [
  { specialty: "Cardiologist" },
  { specialty: "Dermatologist" },
  { specialty: "Pediatrician" },
  { specialty: "Neurologist" },
  { specialty: "Endocrinologist" },
];
export const doctors = [
  {
    _id: 'doc1',
    name: 'Dr. Richard James',
    image: doctor1,
    speciality: 'General Physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Richard has a strong commitment to delivering quality healthcare.',
    fees: 50,
    address: {
      line1: '17th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc2',
    name: 'Dr. Emily Carter',
    image: doc2,
    speciality: 'Dermatologist',
    degree: 'MD Dermatology',
    experience: '6 Years',
    about: 'Dr. Emily specializes in skin treatments and cosmetic dermatology.',
    fees: 70,
    address: {
      line1: '5th Avenue, Green Park',
      line2: 'Downtown, New York',
    },
  },
  {
    _id: 'doc3',
    name: 'Dr. Michael Thompson',
    image: doc3,
    speciality: 'Cardiologist',
    degree: 'MD Cardiology',
    experience: '10 Years',
    about: 'Dr. Michael is an expert in heart diseases and preventive cardiology.',
    fees: 120,
    address: {
      line1: '12th Street, West End',
      line2: 'Baker Street, London',
    },
  },
  // {
  //   _id: 'doc4',
  //   name: 'Dr. Sophia Patel',
  //   image: 'doc4',
  //   speciality: 'Pediatrician',
  //   degree: 'MD Pediatrics',
  //   experience: '8 Years',
  //   about: 'Dr. Sophia is dedicated to child healthcare and development.',
  //   fees: 60,
  //   address: {
  //     line1: 'Sunset Boulevard',
  //     line2: 'Hollywood, Los Angeles',
  //   },
  // },
  // {
  //   _id: 'doc5',
  //   name: 'Dr. David Lee',
  //   image: 'doc5',
  //   speciality: 'Orthopedic',
  //   degree: 'MS Orthopedics',
  //   experience: '12 Years',
  //   about: 'Dr. David has vast experience in bone and joint treatments.',
  //   fees: 100,
  //   address: {
  //     line1: 'Main Road, Sector 14',
  //     line2: 'Downtown, Toronto',
  //   },
  // },
  // {
  //   _id: 'doc6',
  //   name: 'Dr. Olivia Brown',
  //   image: 'doc6',
  //   speciality: 'Gynecologist',
  //   degree: 'MD Gynecology',
  //   experience: '7 Years',
  //   about: 'Dr. Olivia focuses on women’s reproductive health and wellness.',
  //   fees: 80,
  //   address: {
  //     line1: 'Park Lane, Central Square',
  //     line2: 'Birmingham, UK',
  //   },
  // },
  // {
  //   _id: 'doc7',
  //   name: 'Dr. Daniel Wilson',
  //   image: 'doc7',
  //   speciality: 'Neurologist',
  //   degree: 'DM Neurology',
  //   experience: '15 Years',
  //   about: 'Dr. Daniel is highly skilled in treating brain and nervous system disorders.',
  //   fees: 150,
  //   address: {
  //     line1: '7th Cross Road',
  //     line2: 'MG Road, Bengaluru',
  //   },
  // },
  // {
  //   _id: 'doc8',
  //   name: 'Dr. Aisha Khan',
  //   image: 'doc8',
  //   speciality: 'ENT Specialist',
  //   degree: 'MS ENT',
  //   experience: '5 Years',
  //   about: 'Dr. Aisha is an ENT specialist with expertise in sinus and throat issues.',
  //   fees: 55,
  //   address: {
  //     line1: 'Ring Road, Near Metro',
  //     line2: 'Karol Bagh, New Delhi',
  //   },
  // },
  // {
  //   _id: 'doc9',
  //   name: 'Dr. William Johnson',
  //   image: 'doc9',
  //   speciality: 'Oncologist',
  //   degree: 'DM Oncology',
  //   experience: '18 Years',
  //   about: 'Dr. William is known for his research and treatment in cancer care.',
  //   fees: 200,
  //   address: {
  //     line1: 'Elm Street, Midtown',
  //     line2: 'Chicago, USA',
  //   },
  // },
  // {
  //   _id: 'doc10',
  //   name: 'Dr. Grace Miller',
  //   image: 'doc10',
  //   speciality: 'Psychiatrist',
  //   degree: 'MD Psychiatry',
  //   experience: '9 Years',
  //   about: 'Dr. Grace specializes in mental health and counseling therapy.',
  //   fees: 90,
  //   address: {
  //     line1: 'King’s Road, Chelsea',
  //     line2: 'London, UK',
  //   },
  // },
];


