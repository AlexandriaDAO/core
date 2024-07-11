type Category = {
  [key: number]: string;
};

type DDCType = {
  [key: number]: {
    type: string;
    image: string;
    category: Category;
  };
};

const DDC: DDCType = {
  0 : {
    "type": "Generalities and Information Technology",
		"image": "generalities-and-it.png",
    "category": {
      0: "Computer science, knowledge & systems",
      1: "Bibliographies",
      2: "Library & information sciences",
      3: "Factbooks & encyclopedias",
      4: "Blockchain and cryptocurrencies",
      5: "Magazines and journals",
      6: "Associations, organizations & museums",
      7: "News media, journalism & publishing",
      8: "Quotations",
      9: "Manuscripts & rare books",
    }
  },
  1: {
    "type": "Philosophy",
    "image": "philosophy.png",
    "category": {
      0: "Philosophy & theory of knowledge",
      1: "Metaphysics",
      2: "Epistemology",
      3: "Parapsychology & occultism",
      4: "Philosophical schools of thought",
      5: "Psychology",
      6: "Logic",
      7: "Ethics",
      8: "Ancient, medieval & eastern philosophy",
      9: "Modern western philosophy",
    }
  },
  2: {
    "type": "Religion",
    "image": "religion.png",
    "category": {
      0: "Religion",
      1: "Natural theology",
      2: "The Bible",
      3: "Christianity and Christian theology",
      4: "Christian practice & observance",
      5: "Christian pastoral practice & religious orders",
      6: "Christian organization, social work & worship",
      7: "History of Christianity",
      8: "Christian denominations",
      9: "Other religions",
    }
  },
  3: {
    "type": "Social Sciences",
    "image": "social-sciences.png",
    "category": {
      0: "Social sciences, sociology & anthropology",
      1: "Statistics",
      2: "Political science",
      3: "Economics",
      4: "Law",
      5: "Public administration",
      6: "Social problems & social services",
      7: "Education",
      8: "Commerce, communications, transport",
      9: "Customs, etiquette, folklore",
    }
  },
  4: {
    "type": "Language",
    "image": "language.png",
    "category": {
      0: "Linguistics",
      1: "Writing systems",
      2: "English & Old English languages",
      3: "German & related languages",
      4: "French & related languages",
      5: "Italian, Romanian & related languages",
      6: "Spanish, Portuguese, Galician",
      7: "Latin & Italic languages",
      8: "Classical Greek",
      9: "Other languages",
    }
  },
  5: {
    "type": "Science",
    "image": "science.png",
    "category": {
      0: "Science",
      1: "Mathematics",
      2: "Astronomy",
      3: "Physics",
      4: "Chemistry",
      5: "Earth sciences and geology",
      6: "Fossils & prehistoric life",
      7: "Life sciences, biology",
      8: "Plants (Botany)",
      9: "Animals (Zoology)",
    }
  },
  6: {
    "type": "Technology",
    "image": "technology.png",
    "category": {
      0: "Computing",
      1: "Medicine & health",
      2: "Engineering",
      3: "Agriculture",
      4: "Home & family management",
      5: "Management & public relations",
      6: "Chemical engineering",
      7: "Manufacturing",
      8: "Manufacture for specific uses",
      9: "Building & construction",
    }
  },
  7: {
    "type": "Arts and Recreation",
    "image": "art-and-recreation.png",
    "category": {
      0: "The arts",
      1: "Landscaping and area planning",
      2: "Architecture",
      3: "Sculpture, ceramics & metalwork",
      4: "Drawing & decorative arts",
      5: "Painting",
      6: "Graphic arts",
      7: "Photography & computer art",
      8: "Music",
      9: "Sports, games & entertainment",
    }
  },
  8: {
    "type": "Literature",
    "image": "literature.png",
    "category": {
      0: "Literature, rhetoric & criticism",
      1: "American literature in English",
      2: "English & Old English literatures",
      3: "German & related literatures",
      4: "French & related literatures",
      5: "Italian, Romanian & related literatures",
      6: "Spanish, Portuguese, Galician",
      7: "Latin & Italic literatures",
      8: "Classical and modern Greek literatures",
      9: "Other literatures",
    }
  },
  9: {
    "type": "History and Geography",
    "image": "history-and-geography.png",
    "category": {
      0: "History",
      1: "Geography & travel",
      2: "Biography & genealogy",
      3: "Ancient world",
      4: "Europe",
      5: "Asia",
      6: "Africa",
      7: "North America",
      8: "South America",
      9: "Oceania & other areas",
    }
  }
}

export default DDC;