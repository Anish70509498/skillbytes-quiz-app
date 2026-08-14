import asyncio

from pymongo import AsyncMongoClient

from app.config import settings


EXAM_NAMES = [
    "Full Stack Development",
    "Data Structures & Algorithms",
    "Computer Science Fundamentals",
]


SUBJECT_NAMES = [
    "HTML & CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "MongoDB",
    "Data Structures",
    "Algorithms",
    "Computer Networks",
]


# 50-question bank.
# Each chapter receives 15 different questions.
QUESTION_TEMPLATES = [
    (
        "Which technology is primarily used for structuring web pages?",
        ["HTML", "CSS", "Python", "MongoDB"],
        "A",
    ),
    (
        "Which technology is mainly responsible for styling web pages?",
        ["HTML", "CSS", "JavaScript", "SQL"],
        "B",
    ),
    (
        "Which HTML tag is used to create a hyperlink?",
        ["<link>", "<a>", "<href>", "<url>"],
        "B",
    ),
    (
        "Which HTML tag is used for the largest heading?",
        ["<h1>", "<h6>", "<head>", "<title>"],
        "A",
    ),
    (
        "Which CSS property changes the text color?",
        ["font-style", "text-color", "color", "background"],
        "C",
    ),
    (
        "Which CSS layout system is designed for one-dimensional layouts?",
        ["Grid", "Flexbox", "Table", "Float"],
        "B",
    ),
    (
        "Which CSS property controls the space inside an element?",
        ["margin", "padding", "border", "outline"],
        "B",
    ),
    (
        "Which JavaScript keyword declares a block-scoped variable?",
        ["var", "let", "define", "variable"],
        "B",
    ),
    (
        "Which JavaScript keyword declares a constant?",
        ["let", "var", "constant", "const"],
        "D",
    ),
    (
        "Which JavaScript method converts JSON text into an object?",
        ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.convert()"],
        "A",
    ),
    (
        "Which JavaScript method converts an object into a JSON string?",
        ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.convert()"],
        "B",
    ),
    (
        "Which data structure follows FIFO?",
        ["Stack", "Queue", "Tree", "Graph"],
        "B",
    ),
    (
        "Which data structure follows LIFO?",
        ["Queue", "Stack", "Graph", "Heap"],
        "B",
    ),
    (
        "Which data structure stores elements using key-value pairs?",
        ["Stack", "Queue", "Hash Table", "Linked List"],
        "C",
    ),
    (
        "Which data structure consists of nodes connected by edges?",
        ["Array", "Graph", "Stack", "Queue"],
        "B",
    ),
    (
        "Which data structure has a root node and child nodes?",
        ["Tree", "Queue", "Stack", "Hash Table"],
        "A",
    ),
    (
        "Which traversal visits the root before its subtrees?",
        ["Inorder", "Postorder", "Preorder", "Level order"],
        "C",
    ),
    (
        "Which traversal visits the root between the left and right subtrees?",
        ["Inorder", "Preorder", "Postorder", "Level order"],
        "A",
    ),
    (
        "Which algorithm is commonly used to traverse an unweighted graph level by level?",
        ["DFS", "BFS", "Binary Search", "Merge Sort"],
        "B",
    ),
    (
        "Which algorithm is commonly used for depth-first graph traversal?",
        ["BFS", "DFS", "Merge Sort", "Binary Search"],
        "B",
    ),
    (
        "Which sorting algorithm uses a divide-and-conquer approach?",
        ["Merge Sort", "Bubble Sort", "Linear Search", "Counting"],
        "A",
    ),
    (
        "Which search algorithm requires sorted data?",
        ["Linear Search", "Binary Search", "DFS", "BFS"],
        "B",
    ),
    (
        "What is the average time complexity of binary search?",
        ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        "B",
    ),
    (
        "What is the worst-case time complexity of linear search?",
        ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        "C",
    ),
    (
        "Which database is a NoSQL document database?",
        ["MySQL", "Oracle", "MongoDB", "PostgreSQL"],
        "C",
    ),
    (
        "Which MongoDB structure is similar to a relational database table?",
        ["Document", "Collection", "Field", "Index"],
        "B",
    ),
    (
        "Which MongoDB structure stores individual records?",
        ["Collection", "Document", "Database", "Index"],
        "B",
    ),
    (
        "Which SQL command retrieves data from a table?",
        ["GET", "SELECT", "FETCH", "READ"],
        "B",
    ),
    (
        "Which SQL command adds new records?",
        ["ADD", "INSERT", "CREATE", "PUT"],
        "B",
    ),
    (
        "Which SQL command modifies existing records?",
        ["UPDATE", "CHANGE", "MODIFY", "ALTER"],
        "A",
    ),
    (
        "Which SQL command removes records?",
        ["REMOVE", "DELETE", "DROP", "CLEAR"],
        "B",
    ),
    (
        "Which Python data type stores an ordered collection of items?",
        ["List", "Set", "Dictionary", "Boolean"],
        "A",
    ),
    (
        "Which Python data type stores key-value pairs?",
        ["List", "Tuple", "Dictionary", "Set"],
        "C",
    ),
    (
        "Which keyword defines a function in Python?",
        ["function", "func", "def", "define"],
        "C",
    ),
    (
        "Which Node.js runtime executes JavaScript outside the browser?",
        ["Node.js", "React", "MongoDB", "CSS"],
        "A",
    ),
    (
        "Which Node.js module can be used to create an HTTP server?",
        ["http", "html", "server", "request"],
        "A",
    ),
    (
        "Which protocol is primarily used for communication on the web?",
        ["HTTP", "FTP", "SMTP", "SSH"],
        "A",
    ),
    (
        "Which protocol is commonly used for secure web communication?",
        ["HTTP", "HTTPS", "FTP", "TCP"],
        "B",
    ),
    (
        "Which device forwards packets between different networks?",
        ["Switch", "Router", "Hub", "Repeater"],
        "B",
    ),
    (
        "Which OSI layer is responsible for routing packets?",
        ["Physical", "Data Link", "Network", "Application"],
        "C",
    ),
    (
        "Which HTTP method is commonly used to retrieve data?",
        ["POST", "GET", "PUT", "DELETE"],
        "B",
    ),
    (
        "Which HTTP method is commonly used to create a resource?",
        ["GET", "POST", "DELETE", "HEAD"],
        "B",
    ),
    (
        "Which HTTP status code indicates a successful request?",
        ["200", "301", "404", "500"],
        "A",
    ),
    (
        "Which HTTP status code indicates that a resource was not found?",
        ["200", "201", "404", "500"],
        "C",
    ),
    (
        "Which HTTP status code generally indicates a server error?",
        ["200", "301", "404", "500"],
        "D",
    ),
    (
        "Which Git command downloads a remote repository?",
        ["git push", "git pull", "git clone", "git commit"],
        "C",
    ),
    (
        "Which Git command uploads local commits to a remote repository?",
        ["git push", "git pull", "git clone", "git status"],
        "A",
    ),
    (
        "Which Git command records changes in the local repository?",
        ["git save", "git commit", "git upload", "git record"],
        "B",
    ),
    (
        "Which React hook is commonly used to manage component state?",
        ["useState", "useRoute", "useServer", "useHTML"],
        "A",
    ),
    (
        "Which React hook is commonly used for side effects?",
        ["useEffect", "useState", "useHTML", "useData"],
        "A",
    ),
]


async def seed_database():
    client = AsyncMongoClient(
        settings.mongodb_uri
    )

    db = client[
        settings.database_name
    ]

    print("Starting database seed...")

    collections = [
        "users",
        "exams",
        "subjects",
        "chapters",
        "questions",
        "quizzes",
        "attempts",
    ]

    # Clear old data
    for collection_name in collections:
        await db[
            collection_name
        ].delete_many({})

    print("Old data cleared.")

    # --------------------------------------------------------
    # USERS
    # --------------------------------------------------------

    users = []

    for i in range(1, 51):
        users.append(
            {
                "id": f"user_{i:03d}",
                "name": f"Student {i:03d}",
                "email": f"student{i:03d}@example.com",
            }
        )

    await db.users.insert_many(users)

    print("Created 50 users.")

    # --------------------------------------------------------
    # EXAMS
    # --------------------------------------------------------

    exams = []

    for i, exam_name in enumerate(
        EXAM_NAMES,
        start=1,
    ):
        exams.append(
            {
                "id": f"exam_{i:03d}",
                "name": exam_name,
                "description": f"{exam_name} examination",
            }
        )

    await db.exams.insert_many(exams)

    print("Created 3 exams.")

    # --------------------------------------------------------
    # SUBJECTS
    # --------------------------------------------------------

    subjects = []

    for i, subject_name in enumerate(
        SUBJECT_NAMES,
        start=1,
    ):
        exam = exams[
            (i - 1) % len(exams)
        ]

        subjects.append(
            {
                "id": f"subject_{i:03d}",
                "exam_id": exam["id"],
                "name": subject_name,
                "description": f"{subject_name} subject",
            }
        )

    await db.subjects.insert_many(subjects)

    print("Created 10 subjects.")

    # --------------------------------------------------------
    # CHAPTERS
    # --------------------------------------------------------

    chapters = []

    for i in range(1, 31):
        subject = subjects[
            (i - 1) % len(subjects)
        ]

        chapters.append(
            {
                "id": f"chapter_{i:03d}",
                "exam_id": subject["exam_id"],
                "subject_id": subject["id"],
                "number": i,
                "name": f"Chapter {i}: Core Concepts",
            }
        )

    await db.chapters.insert_many(chapters)

    print("Created 30 chapters.")

    # --------------------------------------------------------
    # QUESTIONS
    # --------------------------------------------------------

    questions = []

    questions_per_chapter = 15
    question_number = 1
    template_count = len(
        QUESTION_TEMPLATES
    )

    for chapter_index, chapter in enumerate(
        chapters
    ):
        # Start at a different point in the
        # question bank for each chapter.
        start_index = (
            chapter_index
            * questions_per_chapter
        ) % template_count

        for position in range(
            questions_per_chapter
        ):
            template_index = (
                start_index + position
            ) % template_count

            template = QUESTION_TEMPLATES[
                template_index
            ]

            question_text = template[0]
            option_values = template[1]
            correct_option = template[2]

            questions.append(
                {
                    "id": f"question_{question_number:03d}",
                    "exam_id": chapter["exam_id"],
                    "subject_id": chapter["subject_id"],
                    "chapter_id": chapter["id"],
                    "number": position + 1,
                    "text": question_text,
                    "options": {
                        "A": option_values[0],
                        "B": option_values[1],
                        "C": option_values[2],
                        "D": option_values[3],
                    },
                    "correct_option": correct_option,
                }
            )

            question_number += 1

    await db.questions.insert_many(
        questions
    )

    print(
        f"Created {len(questions)} questions."
    )

    # --------------------------------------------------------
    # INDEXES
    # --------------------------------------------------------

    print("Creating indexes...")

    await db.users.create_index(
        "id",
        unique=True,
    )

    await db.exams.create_index(
        "id",
        unique=True,
    )

    await db.subjects.create_index(
        "id",
        unique=True,
    )

    await db.subjects.create_index(
        "exam_id",
    )

    await db.chapters.create_index(
        "id",
        unique=True,
    )

    await db.chapters.create_index(
        "subject_id",
    )

    await db.questions.create_index(
        "id",
        unique=True,
    )

    await db.questions.create_index(
        "chapter_id",
    )

    await db.quizzes.create_index(
        "id",
        unique=True,
    )

    await db.quizzes.create_index(
        "user_id",
    )

    await db.attempts.create_index(
        "user_id",
    )

    await db.attempts.create_index(
        "quiz_id",
    )

    await db.attempts.create_index(
        "question_id",
    )

    await db.attempts.create_index(
        [
            ("quiz_id", 1),
            ("question_id", 1),
        ],
        unique=True,
    )

    print("Indexes created.")

    print()
    print("=" * 55)
    print("SKILLBYTES DATABASE SEED COMPLETE")
    print("=" * 55)
    print(f"Users     : {len(users)}")
    print(f"Exams     : {len(exams)}")
    print(f"Subjects  : {len(subjects)}")
    print(f"Chapters  : {len(chapters)}")
    print(f"Questions : {len(questions)}")
    print("=" * 55)

    await client.close()


if __name__ == "__main__":
    asyncio.run(
        seed_database()
    )