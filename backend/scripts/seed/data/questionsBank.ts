/**
 * @file scripts/seed/data/questionsBank.ts
 * @description Rich question bank across tech stacks, system design, coding, and behavioral interviews
 */

export interface QuestionTemplate {
  questionText: string;
  questionType: "oral" | "coding" | "system-design";
  idealAnswer: string;
  sampleUserAnswers: string[];
  sampleCodes?: string[];
  sampleDiagrams?: string[];
  roles: string[];
  level: "Junior" | "Mid" | "Senior" | "Lead" | "All";
}

export const QUESTIONS_BANK: QuestionTemplate[] = [
  // --- FRONTEND & JAVASCRIPT/TYPESCRIPT ---
  {
    questionText: "Giải thích cơ chế Event Loop trong JavaScript và sự khác nhau giữa Microtask và Macrotask.",
    questionType: "oral",
    idealAnswer: "JavaScript là single-threaded và sử dụng Call Stack, Web APIs, Task Queue (Macrotask) và Microtask Queue. Khi Call Stack rỗng, Event Loop ưu tiên thực thi toàn bộ Microtask (Promise callbacks, process.nextTick, queueMicrotask, MutationObserver) cho đến khi queue này cạn kiệt trước khi lấy 1 Macrotask (setTimeout, setInterval, setImmediate, I/O events) tiếp theo từ Task Queue.",
    sampleUserAnswers: [
      "Event Loop giúp JavaScript xử lý bất đồng bộ dù chỉ chạy trên 1 thread. Microtask bao gồm Promise.then và được thực thi ngay sau khi call stack rỗng và trước khi render hoặc chạy macrotask như setTimeout.",
      "Cơ chế này quản lý thứ tự chạy: Call Stack -> Microtask Queue (hết sạch) -> 1 Macrotask -> render UI -> lặp lại.",
      "JS là đơn luồng nên cần event loop. Macrotask gồm setTimeout, còn microtask là Promise. Event loop sẽ chạy microtask trước macrotask."
    ],
    roles: ["Frontend Developer", "Full Stack Developer", "Backend Developer"],
    level: "All",
  },
  {
    questionText: "Làm thế nào để tối ưu hiệu năng render trong ứng dụng React quy mô lớn (Core Web Vitals, Virtualization, Memoization)?",
    questionType: "oral",
    idealAnswer: "Các phương pháp tối ưu React: 1) Tránh re-render không cần thiết bằng React.memo, useMemo, useCallback và cấu trúc state phân tán hợp lý (Colocation). 2) Tối ưu danh sách lớn bằng Virtualization (react-window/react-virtualized). 3) Code-splitting theo route hoặc dynamic import với React.lazy & Suspense. 4) Tối ưu assets, lazy loading ảnh và giảm bundle size để cải thiện LCP, CLS, INP.",
    sampleUserAnswers: [
      "Em thường dùng useMemo và useCallback cho component phức tạp, chia nhỏ state, dùng React.lazy để split bundle và sử dụng thư viện react-window khi render danh sách nghìn items.",
      "Tối ưu bằng cách hạn chế state toàn cục, dùng React.memo cho pure components, tối ưu bundle size với dynamic import và theo dõi INP/LCP qua Lighthouse."
    ],
    roles: ["Frontend Developer", "Full Stack Developer"],
    level: "Mid",
  },
  {
    questionText: "Hãy viết một hàm TypeScript `debounce<T>(fn: T, delay: number)` hoàn chỉnh có hỗ trợ xử lý typing chặt chẽ và clear timeout khi cần.",
    questionType: "coding",
    idealAnswer: "```typescript\nexport function debounce<T extends (...args: any[]) => any>(\n  func: T,\n  delay: number\n): ((...args: Parameters<T>) => void) & { cancel: () => void } {\n  let timeoutId: ReturnType<typeof setTimeout> | null = null;\n\n  const debounced = (...args: Parameters<T>) => {\n    if (timeoutId) clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => {\n      func(...args);\n      timeoutId = null;\n    }, delay);\n  };\n\n  debounced.cancel = () => {\n    if (timeoutId) {\n      clearTimeout(timeoutId);\n      timeoutId = null;\n    }\n  };\n\n  return debounced;\n}\n```",
    sampleCodes: [
      "function debounce(fn: Function, delay: number) {\n  let timer: any;\n  return (...args: any[]) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
      "export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {\n  let timer: NodeJS.Timeout | null = null;\n  const wrapper = (...args: Parameters<T>) => {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n  wrapper.cancel = () => { if (timer) clearTimeout(timer); };\n  return wrapper;\n}"
    ],
    sampleUserAnswers: [
      "Em đã viết hàm debounce với TypeScript generic, lưu timerId trong closure và cung cấp hàm cancel để dọn dẹp timer khi component unmount."
    ],
    roles: ["Frontend Developer", "Full Stack Developer"],
    level: "Senior",
  },

  // --- BACKEND & DISTRIBUTED SYSTEMS ---
  {
    questionText: "Khi nào bạn chọn SQL (PostgreSQL, MySQL) thay vì NoSQL (MongoDB, DynamoDB) và ngược lại? Giải thích qua định lý CAP.",
    questionType: "oral",
    idealAnswer: "Chọn SQL khi hệ thống đòi hỏi tính toàn vẹn dữ liệu cao (ACID transactions), cấu trúc quan hệ phức tạp, dữ liệu có schema rõ ràng (e.g. hệ thống thanh toán, ngân hàng). Chọn NoSQL khi cần tốc độ ghi/đọc cực lớn, schema linh hoạt hoặc lưu trữ document/key-value phân tán. Theo CAP theorem: Hệ thống phân tán chỉ đảm bảo được 2 trong 3 yếu tố (Consistency, Availability, Partition Tolerance). SQL thường hướng tới CA/CP, còn NoSQL phân tán (như Cassandra, DynamoDB) thường hướng tới AP với Eventual Consistency.",
    sampleUserAnswers: [
      "SQL phù hợp cho tài chính thanh toán vì đảm bảo ACID tuyệt đối. NoSQL như Mongo hay DynamoDB phù hợp cho catalog sản phẩm, activity logs hoặc khi cần scale ngang dễ dàng.",
      "Dựa vào CAP theorem, nếu cần Consistency cao thì dùng SQL/CP, nếu cần High Availability và mở rộng ngang thì NoSQL (AP/BASE) là lựa chọn tối ưu hơn."
    ],
    roles: ["Backend Developer", "Full Stack Developer", "DevOps Engineer"],
    level: "Mid",
  },
  {
    questionText: "Làm thế nào để xử lý Race Condition khi nhiều người dùng cùng bấm đặt mua một món hàng chỉ còn 1 sản phẩm duy nhất (Flash Sale)?",
    questionType: "oral",
    idealAnswer: "Các giải pháp: 1) Database Locking: Pessimistic Locking (`SELECT ... FOR UPDATE`) hoặc Optimistic Locking với `version` column. 2) In-memory Atomic Operations: Dùng Redis Lua Script hoặc `DECR` để trừ tồn kho atomic tốc độ cao. 3) Message Queue: Đẩy yêu cầu vào hàng đợi (Kafka, RabbitMQ, BullMQ) xử lý tuần tự (FIFO) để giải phóng tải database. 4) Distributed Lock (Redlock).",
    sampleUserAnswers: [
      "Em sẽ dùng Redis với Lua script để trừ tồn kho nguyên tử (atomic), sau đó đẩy event vào BullMQ/Kafka để ghi nhận đơn hàng bất đồng bộ vào DB.",
      "Ở tầng DB có thể dùng Optimistic Lock bằng version column hoặc Pessimistic Lock, tuy nhiên với lượng traffic khủng thì Redis atomic DECR là tối ưu nhất."
    ],
    roles: ["Backend Developer", "Full Stack Developer"],
    level: "Senior",
  },
  {
    questionText: "Hãy viết mã nguồn triển khai Rate Limiting thuật toán Sliding Window Counter hoặc Token Bucket bằng Redis/Node.js.",
    questionType: "coding",
    idealAnswer: "```typescript\nimport Redis from 'ioredis';\n\nexport async function isRateLimited(redis: Redis, key: string, limit: number, windowSec: number): Promise<boolean> {\n  const now = Date.now();\n  const windowStart = now - windowSec * 1000;\n  const pipeline = redis.pipeline();\n\n  pipeline.zremrangebyscore(key, '-inf', windowStart);\n  pipeline.zadd(key, now, `${now}-${Math.random()}`);\n  pipeline.zcard(key);\n  pipeline.expire(key, windowSec);\n\n  const results = await pipeline.exec();\n  const count = results?.[2]?.[1] as number;\n  return count > limit;\n}\n```",
    sampleCodes: [
      "async function checkLimit(redis: any, ip: string) {\n  const key = `ratelimit:${ip}`;\n  const count = await redis.incr(key);\n  if (count === 1) await redis.expire(key, 60);\n  return count <= 100;\n}",
      "export async function slidingWindowLimiter(redis: Redis, userKey: string, maxReq: number, windowMs: number) {\n  const now = Date.now();\n  const clearBefore = now - windowMs;\n  const multi = redis.multi();\n  multi.zremrangebyscore(userKey, 0, clearBefore);\n  multi.zadd(userKey, now, now.toString());\n  multi.zcard(userKey);\n  multi.expire(userKey, Math.ceil(windowMs / 1000));\n  const res = await multi.exec();\n  const total = (res && res[2]) ? res[2][1] as number : 0;\n  return total <= maxReq;\n}"
    ],
    sampleUserAnswers: [
      "Em triển khai Sliding Window Log dùng Redis Sorted Set (ZSET) với score là timestamp. Loại bỏ log cũ bằng ZREMRANGEBYSCORE và kiểm tra số lượng hiện tại bằng ZCARD."
    ],
    roles: ["Backend Developer", "Full Stack Developer", "DevOps Engineer"],
    level: "Senior",
  },

  // --- SYSTEM DESIGN & CLOUD ARCHITECTURE ---
  {
    questionText: "Thiết kế hệ thống URL Shortener (như Bit.ly) phục vụ 100 triệu URL mỗi ngày, độ trễ đọc dưới 10ms.",
    questionType: "system-design",
    idealAnswer: "Kiến trúc hệ thống: 1) API Gateway & Rate Limiter tiếp nhận request. 2) Hash Algorithm: Dùng Base62 encode kết hợp Distributed ID Generator (Snowflake hoặc Pre-allocated ID ranges từ Zookeeper/Redis) để tạo chuỗi 7 ký tự (62^7 ~ 3.5 nghìn tỷ URLs). 3) Caching: Redis Cluster lưu cache 20% URLs hot nhất theo nguyên lý Pareto để đạt độ trễ < 5ms. 4) Storage: NoSQL (Cassandra/DynamoDB) hoặc PostgreSQL sharded by hash. 5) Analytics Pipeline: Gửi click events qua Kafka -> Spark/ClickHouse để thống kê.",
    sampleDiagrams: [
      "User -> DNS -> Cloudflare -> API Gateway -> [App Servers] -> Redis Cache -> NoSQL (DynamoDB)\nApp Server -> Kafka -> ClickHouse (Analytics Dashboard)",
      "Client -> Load Balancer -> Node.js Service (Base62 + Snowflake ID) -> Redis LRU Cache (Read 95% hits) -> PostgreSQL Master-Slave DB"
    ],
    sampleUserAnswers: [
      "Em thiết kế với Base62 encoding cho ID sinh từ Snowflake generator, đặt Redis cache phía trước DB để 95% read traffic lấy từ cache < 5ms, dữ liệu phân tích click ghi vào Kafka."
    ],
    roles: ["Backend Developer", "Full Stack Developer", "DevOps Engineer"],
    level: "Senior",
  },
  {
    questionText: "Thiết kế hệ thống Real-time Chat & Notification phục vụ hàng triệu người dùng đồng thời (WhatsApp / Slack clone).",
    questionType: "system-design",
    idealAnswer: "Kiến trúc gồm: 1) WebSocket Gateway (Node.js/Go) quản lý các kết nối persistent connection. 2) Redis Pub/Sub hoặc NATS trung chuyển message giữa các WebSocket servers. 3) Message Storage: ScyllaDB/Cassandra lưu tin nhắn tối ưu cho time-series và append-only writes. 4) Push Notification Service: Tích hợp FCM/APNs qua BullMQ worker pool. 5) Media storage: Upload trực tiếp S3 qua Presigned URLs.",
    sampleDiagrams: [
      "Client A -> WebSocket Gateway 1 -> Redis Pub/Sub -> WebSocket Gateway 2 -> Client B\nGateway -> Kafka -> ScyllaDB Message Store & ElasticSearch (Search)",
      "App -> Load Balancer (WSS) -> Go WebSocket Cluster -> Redis Cluster (Presence & Routing) -> MongoDB / S3"
    ],
    sampleUserAnswers: [
      "Em tách biệt WebSocket Gateway để giữ kết nối socket, dùng Redis Cluster để định tuyến tin nhắn giữa các server và lưu lịch sử chat vào Cassandra/MongoDB."
    ],
    roles: ["Backend Developer", "Full Stack Developer"],
    level: "Senior",
  },

  // --- DEVOPS & CI/CD ---
  {
    questionText: "Giải thích các chiến lược triển khai: Blue-Green Deployment, Canary Deployment và Rolling Update. Khi nào nên dùng loại nào?",
    questionType: "oral",
    idealAnswer: "1) Rolling Update: Cập nhật dần từng pod/instance, tiết kiệm tài nguyên nhưng cả 2 phiên bản chạy song song tạm thời. 2) Blue-Green: Dựng 2 môi trường hoàn toàn độc lập, switch traffic 100% qua router/load balancer. Ưu điểm rollback tức thì, nhược điểm tốn gấp đôi tài nguyên. 3) Canary Deployment: Điều hướng một tỷ lệ nhỏ traffic (e.g. 5%) sang phiên bản mới để kiểm tra metric/lỗi trước khi rollout 100%. Phù hợp với hệ thống lớn, giảm thiểu rủi ro cao.",
    sampleUserAnswers: [
      "Rolling update cập nhật từng pod tiết kiệm resource. Blue-green tạo môi trường song song switch tức thì. Canary route 5-10% traffic test trước khi rollout toàn bộ.",
      "Với các tính năng rủi ro cao, Canary Deployment kết hợp Istio/Argo Rollouts là lựa chọn chuẩn nhất để phát hiện lỗi sớm."
    ],
    roles: ["DevOps Engineer", "Backend Developer", "Full Stack Developer"],
    level: "Mid",
  },

  // --- AI / DATA ENGINEERING ---
  {
    questionText: "RAG (Retrieval-Augmented Generation) là gì? Hãy trình bày các bước xây dựng pipeline RAG chất lượng cao và cách giải quyết hallucination.",
    questionType: "oral",
    idealAnswer: "RAG kết hợp LLM với kho tri thức ngoài để tăng độ chính xác và giảm hallucination. Pipeline gồm: 1) Document Ingestion & Chunking (phân đoạn hợp lý với overlap). 2) Embedding: Chuyển văn bản thành vector và lưu trong Vector DB (Pinecone, Qdrant, Milvus). 3) Retrieval: Tìm kiếm Hybrid Search (Dense vector search + BM25 keyword search) kết hợp Re-ranking. 4) Prompt Augmentation & Generation: Đưa context retrieved vào LLM với hướng dẫn strict context adherence.",
    sampleUserAnswers: [
      "RAG kết hợp vector search và LLM. Dữ liệu được chunk, embed và lưu vào Vector DB. Khi user hỏi, ta query semantic search lấy context đưa vào prompt cho LLM sinh câu trả lời.",
      "Để giảm ảo giác trong RAG, cần tối ưu chunking, dùng hybrid search kèm re-ranker (Cohere Rerank) và yêu cầu LLM trích dẫn nguồn (citations)."
    ],
    roles: ["AI/ML Engineer", "Backend Developer", "Full Stack Developer"],
    level: "Senior",
  },

  // --- BEHAVIORAL & LEADERSHIP (HR) ---
  {
    questionText: "Kể về một tình huống bạn gặp phải sự bất đồng quan điểm kỹ thuật gay gắt với đồng nghiệp hoặc Tech Lead và cách bạn giải quyết.",
    questionType: "oral",
    idealAnswer: "Sử dụng mô hình STAR (Situation, Task, Action, Result): 1) Nêu rõ bối cảnh và nguyên nhân bất đồng (e.g. chọn công nghệ, kiến trúc DB). 2) Hành động: Không tranh luận cảm tính, tạo buổi trao đổi dựa trên dữ liệu (PoC so sánh benchmark, chi phí bảo trì, rủi ro). 3) Kết quả: Đạt được sự đồng thuận dựa trên mục tiêu chung của sản phẩm, giữ gìn tinh thần đồng đội.",
    sampleUserAnswers: [
      "Khi team em bất đồng giữa việc dùng Redux hay Zustand, em đã làm một bản PoC nhỏ so sánh bundle size, boilerplate code và thời gian dev, sau đó cả team đã thống nhất chọn Zustand.",
      "Em luôn tiếp cận với tinh thần data-driven, lắng nghe luận điểm của đồng nghiệp, làm thử nghiệm thực tế (benchmark) để đưa ra quyết định tối ưu nhất cho dự án."
    ],
    roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "AI/ML Engineer"],
    level: "All",
  }
];
