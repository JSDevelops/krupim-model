--
-- PostgreSQL database dump
--

\restrict 1AVVSBGq6dZu14lofVuO2rGZH2yKbYYkpHWQEg6qDpCTae1E1dYwvsaPfQSacLF

-- Dumped from database version 16.11 (Homebrew)
-- Dumped by pg_dump version 16.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: content_type; Type: TYPE; Schema: public; Owner: 3designs
--

CREATE TYPE public.content_type AS ENUM (
    'video',
    'ar3d',
    'text',
    'quiz',
    'simulation'
);


ALTER TYPE public.content_type OWNER TO "3designs";

--
-- Name: lesson_status; Type: TYPE; Schema: public; Owner: 3designs
--

CREATE TYPE public.lesson_status AS ENUM (
    'not_started',
    'in_progress',
    'completed'
);


ALTER TYPE public.lesson_status OWNER TO "3designs";

--
-- Name: session_type; Type: TYPE; Schema: public; Owner: 3designs
--

CREATE TYPE public.session_type AS ENUM (
    'gemini_chat',
    'gemini_live',
    'ai_scan',
    'openai_chat',
    'claude_chat',
    'simulation'
);


ALTER TYPE public.session_type OWNER TO "3designs";

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: 3designs
--

CREATE TYPE public.user_role AS ENUM (
    'developer',
    'teacher',
    'student'
);


ALTER TYPE public.user_role OWNER TO "3designs";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_provider_settings; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.ai_provider_settings (
    provider text NOT NULL,
    api_key_encrypted text,
    model text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_provider_settings_provider_check CHECK ((provider = ANY (ARRAY['gemini'::text, 'openai'::text, 'claude'::text])))
);


ALTER TABLE public.ai_provider_settings OWNER TO "3designs";

--
-- Name: ai_scan_items; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.ai_scan_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_th text NOT NULL,
    name_en text NOT NULL,
    category text NOT NULL,
    subcategory text,
    description text,
    location text,
    service_tips text,
    english_phrases text[],
    image_url text,
    glb_url text,
    usdz_url text,
    pronounce text,
    blender_script text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sentence text
);


ALTER TABLE public.ai_scan_items OWNER TO "3designs";

--
-- Name: api_rate_limits; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.api_rate_limits (
    bucket_key text NOT NULL,
    request_count integer DEFAULT 1 NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.api_rate_limits OWNER TO "3designs";

--
-- Name: app_users; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.app_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    session_version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.app_users OWNER TO "3designs";

--
-- Name: ar_items; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.ar_items (
    id text NOT NULL,
    name_en text NOT NULL,
    name_th text NOT NULL,
    pronounce text,
    sentence text,
    description text,
    image_url text,
    glb_url text,
    usdz_url text,
    blender_script text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ar_items OWNER TO "3designs";

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid,
    unit_id uuid,
    title text NOT NULL,
    description text,
    rubric_json jsonb,
    max_score integer DEFAULT 100 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assessments OWNER TO "3designs";

--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.assignment_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid,
    student_id uuid,
    score integer,
    feedback text,
    attachment_name text,
    attachment_url text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    graded_at timestamp with time zone,
    status text DEFAULT 'submitted'::text NOT NULL,
    return_reason text,
    returned_at timestamp with time zone,
    CONSTRAINT assignment_submissions_status_check CHECK ((status = ANY (ARRAY['submitted'::text, 'returned'::text, 'resubmitted'::text])))
);


ALTER TABLE public.assignment_submissions OWNER TO "3designs";

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid,
    teacher_id uuid,
    title text NOT NULL,
    description text,
    activity_type text DEFAULT 'Familiarize'::text NOT NULL,
    lesson_id uuid,
    scenario_id uuid,
    due_date timestamp with time zone,
    max_score integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lesson_plan_id text
);


ALTER TABLE public.assignments OWNER TO "3designs";

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    details_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO "3designs";

--
-- Name: certificate_events; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.certificate_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    certificate_id uuid NOT NULL,
    actor_id uuid,
    event_type text NOT NULL,
    details_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT certificate_events_event_type_check CHECK ((event_type = ANY (ARRAY['issue'::text, 'reissue'::text, 'revoke'::text, 'restore'::text])))
);


ALTER TABLE public.certificate_events OWNER TO "3designs";

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    certificate_code text DEFAULT ('FINE-'::text || upper(encode(public.gen_random_bytes(8), 'hex'::text))) NOT NULL,
    student_id uuid NOT NULL,
    certificate_type text DEFAULT 'fine-fb-service'::text NOT NULL,
    issued_name text NOT NULL,
    school_name text,
    overall_score integer NOT NULL,
    score_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT certificates_overall_score_check CHECK (((overall_score >= 0) AND (overall_score <= 100)))
);


ALTER TABLE public.certificates OWNER TO "3designs";

--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    session_type public.session_type NOT NULL,
    topic text,
    messages_json jsonb DEFAULT '[]'::jsonb NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone
);


ALTER TABLE public.chat_sessions OWNER TO "3designs";

--
-- Name: class_invites; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.class_invites (
    short_code text NOT NULL,
    target_class text NOT NULL,
    teacher_name text,
    school_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    class_id uuid,
    created_by uuid,
    max_uses integer DEFAULT 1 NOT NULL,
    use_count integer DEFAULT 0 NOT NULL,
    revoked_at timestamp with time zone
);


ALTER TABLE public.class_invites OWNER TO "3designs";

--
-- Name: class_students; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.class_students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid,
    student_id uuid,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.class_students OWNER TO "3designs";

--
-- Name: classes; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid,
    teacher_id uuid,
    name text NOT NULL,
    description text,
    year integer,
    semester integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.classes OWNER TO "3designs";

--
-- Name: content_library; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.content_library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type text NOT NULL,
    name_th text NOT NULL,
    name_en text NOT NULL,
    unit_label text DEFAULT 'Unit 1'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT content_library_content_type_check CHECK ((content_type = ANY (ARRAY['AR Object'::text, 'AI Scan'::text, 'Simulation'::text, 'Lesson'::text]))),
    CONSTRAINT content_library_status_check CHECK ((status = ANY (ARRAY['published'::text, 'draft'::text])))
);


ALTER TABLE public.content_library OWNER TO "3designs";

--
-- Name: courses; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    title_en text,
    description text,
    thumbnail_url text,
    created_by uuid,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO "3designs";

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    course_id uuid,
    class_id uuid,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.enrollments OWNER TO "3designs";

--
-- Name: fine_lesson_plans; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.fine_lesson_plans (
    id text NOT NULL,
    title text NOT NULL,
    subject text,
    level text,
    term text,
    duration text,
    target_class text,
    weeks text,
    concept text,
    objectives_k jsonb DEFAULT '[]'::jsonb NOT NULL,
    objectives_s jsonb DEFAULT '[]'::jsonb NOT NULL,
    objectives_a jsonb DEFAULT '[]'::jsonb NOT NULL,
    objectives_ap jsonb DEFAULT '[]'::jsonb NOT NULL,
    vocabulary jsonb DEFAULT '[]'::jsonb NOT NULL,
    sentences jsonb DEFAULT '[]'::jsonb NOT NULL,
    activities_lead text,
    activities_f text,
    activities_i text,
    activities_n text,
    activities_e text,
    activities_wrap text,
    teacher_name text,
    teacher_email public.citext,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    teacher_id uuid,
    class_id uuid,
    published_at timestamp with time zone,
    publication_status text DEFAULT 'draft'::text NOT NULL,
    CONSTRAINT fine_lesson_plans_publication_status_check CHECK ((publication_status = ANY (ARRAY['draft'::text, 'published'::text])))
);


ALTER TABLE public.fine_lesson_plans OWNER TO "3designs";

--
-- Name: generated_model_assets; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.generated_model_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    file_name text NOT NULL,
    mime_type text DEFAULT 'model/gltf-binary'::text NOT NULL,
    size_bytes bigint NOT NULL,
    file_data bytea NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT generated_model_assets_size_bytes_check CHECK ((size_bytes > 0))
);


ALTER TABLE public.generated_model_assets OWNER TO "3designs";

--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.integration_settings (
    provider text NOT NULL,
    api_key_encrypted text,
    config_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.integration_settings OWNER TO "3designs";

--
-- Name: learning_analytics; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.learning_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    course_id uuid,
    date date DEFAULT CURRENT_DATE NOT NULL,
    knowledge_score numeric(5,2) DEFAULT 0 NOT NULL,
    skills_score numeric(5,2) DEFAULT 0 NOT NULL,
    attitude_score numeric(5,2) DEFAULT 0 NOT NULL,
    competency_score numeric(5,2) DEFAULT 0 NOT NULL,
    overall_score numeric(5,2) DEFAULT 0 NOT NULL,
    lessons_completed integer DEFAULT 0 NOT NULL,
    time_spent_minutes integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.learning_analytics OWNER TO "3designs";

--
-- Name: learning_events; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.learning_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    event_type text NOT NULL,
    reference_type text NOT NULL,
    reference_id text NOT NULL,
    score integer,
    metadata_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.learning_events OWNER TO "3designs";

--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    lesson_id uuid,
    status public.lesson_status DEFAULT 'not_started'::public.lesson_status NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    time_spent_minutes integer DEFAULT 0 NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lesson_progress OWNER TO "3designs";

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    unit_id uuid,
    title text NOT NULL,
    content_type public.content_type NOT NULL,
    content_url text,
    content_body text,
    duration_minutes integer DEFAULT 0 NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lessons OWNER TO "3designs";

--
-- Name: model_generation_jobs; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.model_generation_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text DEFAULT 'tripo'::text NOT NULL,
    external_task_id text,
    created_by uuid NOT NULL,
    ar_item_id text,
    asset_id uuid,
    prompt text NOT NULL,
    negative_prompt text,
    model_version text,
    name_en text NOT NULL,
    name_th text NOT NULL,
    description text,
    status text DEFAULT 'queued'::text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    glb_url text,
    preview_url text,
    error_message text,
    raw_response jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT model_generation_jobs_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT model_generation_jobs_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'success'::text, 'failed'::text, 'cancelled'::text, 'banned'::text, 'expired'::text, 'unknown'::text, 'preview'::text])))
);


ALTER TABLE public.model_generation_jobs OWNER TO "3designs";

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    link_url text,
    read_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO "3designs";

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO "3designs";

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    school_id uuid,
    school_name text,
    name text NOT NULL,
    email public.citext NOT NULL,
    role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    requested_role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    approval_status text DEFAULT 'active'::text NOT NULL,
    avatar_url text,
    phone text,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pdpa_consent boolean DEFAULT false NOT NULL,
    pdpa_consent_at timestamp with time zone,
    pdpa_consent_version text DEFAULT '1.0'::text,
    CONSTRAINT profiles_approval_status_check CHECK ((approval_status = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text])))
);


ALTER TABLE public.profiles OWNER TO "3designs";

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.schema_migrations (
    migration_name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO "3designs";

--
-- Name: schools; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.schools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    contact text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schools OWNER TO "3designs";

--
-- Name: simulation_scenarios; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.simulation_scenarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    unit_id uuid,
    title text NOT NULL,
    description text,
    scenario_type text NOT NULL,
    difficulty text DEFAULT 'beginner'::text NOT NULL,
    max_score integer DEFAULT 100 NOT NULL,
    time_limit_minutes integer DEFAULT 10 NOT NULL,
    script_json jsonb,
    rubric_json jsonb,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.simulation_scenarios OWNER TO "3designs";

--
-- Name: simulation_sessions; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.simulation_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    scenario_id uuid,
    score integer DEFAULT 0 NOT NULL,
    max_score integer DEFAULT 100 NOT NULL,
    duration_minutes integer DEFAULT 0 NOT NULL,
    feedback_json jsonb,
    conversation_json jsonb,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    lesson_plan_id text
);


ALTER TABLE public.simulation_sessions OWNER TO "3designs";

--
-- Name: stored_files; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.stored_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    assignment_id uuid,
    purpose text NOT NULL,
    original_name text NOT NULL,
    storage_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    file_data bytea,
    CONSTRAINT stored_files_size_bytes_check CHECK (((size_bytes > 0) AND (size_bytes <= 12582912)))
);


ALTER TABLE public.stored_files OWNER TO "3designs";

--
-- Name: student_assessments; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.student_assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid,
    assessment_id uuid,
    score integer DEFAULT 0 NOT NULL,
    knowledge_score integer DEFAULT 0 NOT NULL,
    skills_score integer DEFAULT 0 NOT NULL,
    attitude_score integer DEFAULT 0 NOT NULL,
    competency_score integer DEFAULT 0 NOT NULL,
    feedback text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    graded_by uuid,
    rubric_level_k smallint,
    rubric_level_s smallint,
    rubric_level_a smallint,
    rubric_level_c smallint,
    CONSTRAINT student_assessments_rubric_level_a_check CHECK (((rubric_level_a >= 1) AND (rubric_level_a <= 4))),
    CONSTRAINT student_assessments_rubric_level_c_check CHECK (((rubric_level_c >= 1) AND (rubric_level_c <= 4))),
    CONSTRAINT student_assessments_rubric_level_k_check CHECK (((rubric_level_k >= 1) AND (rubric_level_k <= 4))),
    CONSTRAINT student_assessments_rubric_level_s_check CHECK (((rubric_level_s >= 1) AND (rubric_level_s <= 4)))
);


ALTER TABLE public.student_assessments OWNER TO "3designs";

--
-- Name: system_announcements; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.system_announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    priority text DEFAULT 'general'::text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    link_url text,
    created_by uuid,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT system_announcements_priority_check CHECK ((priority = ANY (ARRAY['urgent'::text, 'general'::text, 'event'::text])))
);


ALTER TABLE public.system_announcements OWNER TO "3designs";

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.system_settings (
    setting_key text NOT NULL,
    value_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_settings OWNER TO "3designs";

--
-- Name: units; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.units (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid,
    title text NOT NULL,
    title_en text,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    thumbnail_url text,
    ar_model_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.units OWNER TO "3designs";

--
-- Name: uploaded_assets; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.uploaded_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    file_data bytea NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.uploaded_assets OWNER TO "3designs";

--
-- Name: vocabulary_items; Type: TABLE; Schema: public; Owner: 3designs
--

CREATE TABLE public.vocabulary_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_en text NOT NULL,
    name_th text NOT NULL,
    category text DEFAULT 'tableware'::text NOT NULL,
    category_th text DEFAULT 'อุปกรณ์บนโต๊ะอาหาร'::text NOT NULL,
    pronounce text,
    use_desc text NOT NULL,
    sentence text NOT NULL,
    glb_url text,
    usdz_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    created_by uuid
);


ALTER TABLE public.vocabulary_items OWNER TO "3designs";

--
-- Data for Name: ai_provider_settings; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.ai_provider_settings (provider, api_key_encrypted, model, is_active, updated_by, updated_at) FROM stdin;
openai	\N	gpt-4.1-mini	f	\N	2026-08-26 18:06:42.08228+07
claude	\N	claude-sonnet-4-6	f	\N	2026-08-26 18:06:42.08228+07
gemini	\N	gemini-3.6-flash	t	00000000-0000-0000-0000-000000000001	2026-08-26 18:47:55.807417+07
\.


--
-- Data for Name: ai_scan_items; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.ai_scan_items (id, name_th, name_en, category, subcategory, description, location, service_tips, english_phrases, image_url, glb_url, usdz_url, pronounce, blender_script, created_at, sentence) FROM stdin;
1559fad4-fb54-41b6-941c-bc5a6977852a	จานเรียกน้ำย่อย / จานอาหารว่าง	Appetizer Plate	tableware	\N	จานขนาดเล็กสำหรับใส่ของว่างหรืออาหารเรียกน้ำย่อยก่อนเสิร์ฟอาหารจานหลัก	\N	Please place the appetizer plate on the table before the main course.	\N	\N	\N	\N	แอพ-พิ-ไท-เซอร์ เพลท	\N	2026-08-26 19:02:22.324127+07	Please place the appetizer plate on the table before the main course.
25241a3c-4818-484d-9829-c026c669b75d	จานอาหารหลัก	Dinner Plate	tableware	\N	ใส่อาหารจานหลัก	\N	The dinner plate is used for serving main courses.	\N	\N	\N	\N	/ˈdɪnər pleɪt/	\N	2026-08-26 19:02:22.324127+07	The dinner plate is used for serving main courses.
2d64f2de-af2c-4b70-8a14-faefa7b48f93	จานสลัด	Salad Plate	tableware	\N	ใส่สลัดหรืออาหารเรียกน้ำย่อย	\N	The salad plate is used for appetizers or salad.	\N	\N	\N	\N	/ˈsæləd pleɪt/	\N	2026-08-26 19:02:22.324127+07	The salad plate is used for appetizers or salad.
5b43818a-abf5-473c-80ed-9516d42a5597	จานขนมปัง	Bread Plate	tableware	\N	วางขนมปังและเนย	\N	The bread plate is placed on the left side of the setting.	\N	\N	\N	\N	/bred pleɪt/	\N	2026-08-26 19:02:22.324127+07	The bread plate is placed on the left side of the setting.
d9b413a0-38ce-429e-86e5-a58cae7abe72	จานรองถ้วยชา	Saucer	tableware	\N	รองถ้วยชาและกาแฟ	\N	Place the cup neatly on the saucer.	\N	\N	\N	\N	/ˈsɔːsər/	\N	2026-08-26 19:02:22.324127+07	Place the cup neatly on the saucer.
3a6ada82-57cf-48a8-b6a6-c4ed9a31e6b5	ถ้วยซุป	Soup Bowl	tableware	\N	ใส่ซุป	\N	The soup bowl is used for serving hot soup.	\N	\N	\N	\N	/suːp bəʊl/	\N	2026-08-26 19:02:22.324127+07	The soup bowl is used for serving hot soup.
8e09eee5-0155-4420-b775-f3b69b6a79cf	ถ้วยกาแฟ	Coffee Cup	tableware	\N	ใส่กาแฟ	\N	We serve freshly brewed coffee in a coffee cup.	\N	\N	\N	\N	/ˈkɒfi kʌp/	\N	2026-08-26 19:02:22.324127+07	We serve freshly brewed coffee in a coffee cup.
7ca7fc78-09e1-462e-bb6a-d04f698206ff	ถ้วยชา	Tea Cup	tableware	\N	ใส่ชา	\N	Here is your tea cup for hot Jasmine tea.	\N	\N	\N	\N	/tiː kʌp/	\N	2026-08-26 19:02:22.324127+07	Here is your tea cup for hot Jasmine tea.
fdcb9f25-32e9-4cde-841a-04a5f3863f0d	ชามของหวาน	Dessert Bowl	tableware	\N	ใส่ของหวาน	\N	The dessert bowl is ideal for ice cream and fruits.	\N	\N	\N	\N	/dɪˈzɜːt bəʊl/	\N	2026-08-26 19:02:22.324127+07	The dessert bowl is ideal for ice cream and fruits.
c541d084-6d9d-4b92-867b-2160ea2375fd	ถ้วยน้ำจิ้ม	Sauce Dish	tableware	\N	ใส่น้ำจิ้ม	\N	Pass the sauce dish to the guest.	\N	\N	\N	\N	/sɔːs dɪʃ/	\N	2026-08-26 19:02:22.324127+07	Pass the sauce dish to the guest.
8a015f6b-85a6-47b7-b49c-046b1aaf92a4	มีดอาหารหลัก	Dinner Knife	cutlery	\N	ตัดอาหารจานหลัก	\N	This is a dinner knife. It is used for cutting food.	\N	\N	\N	\N	/ˈdɪnər naɪf/	\N	2026-08-26 19:02:22.324127+07	This is a dinner knife. It is used for cutting food.
7dd8a287-c591-4493-8c9f-1180c92e8fc1	ส้อมอาหารหลัก	Dinner Fork	cutlery	\N	รับประทานอาหารจานหลัก	\N	This is a dinner fork. It is used for the main course.	\N	\N	\N	\N	/ˈdɪnər fɔːk/	\N	2026-08-26 19:02:22.324127+07	This is a dinner fork. It is used for the main course.
7aacbbd6-720a-412c-8648-16f238e3c521	ช้อนอาหาร	Dinner Spoon	cutlery	\N	รับประทานอาหาร	\N	The dinner spoon is used for rice or main food.	\N	\N	\N	\N	/ˈdɪnər spuːn/	\N	2026-08-26 19:02:22.324127+07	The dinner spoon is used for rice or main food.
1c7d0653-e3aa-46d8-814c-5bb87fbdecab	ช้อนซุป	Soup Spoon	cutlery	\N	รับประทานซุป	\N	Use the soup spoon for drinking soup.	\N	\N	\N	\N	/suːp spuːn/	\N	2026-08-26 19:02:22.324127+07	Use the soup spoon for drinking soup.
c264cd29-78c5-4b12-bfe7-4e3e4d90282f	มีดเนย	Butter Knife	cutlery	\N	ทาเนยบนขนมปัง	\N	Use the butter knife to spread butter on your bread.	\N	\N	\N	\N	/ˈbʌtər naɪf/	\N	2026-08-26 19:02:22.324127+07	Use the butter knife to spread butter on your bread.
41345fb8-1207-42ce-b45b-699fb6d35725	ส้อมสลัด	Salad Fork	cutlery	\N	รับประทานสลัด	\N	The salad fork is slightly smaller than the dinner fork.	\N	\N	\N	\N	/ˈsæləd fɔːk/	\N	2026-08-26 19:02:22.324127+07	The salad fork is slightly smaller than the dinner fork.
3c2d1be1-a976-405f-922f-f16978772909	มีดปลา	Fish Knife	cutlery	\N	รับประทานปลา	\N	The fish knife has a special blunt blade for lifting fish bones.	\N	\N	\N	\N	/fɪʃ naɪf/	\N	2026-08-26 19:02:22.324127+07	The fish knife has a special blunt blade for lifting fish bones.
6fe11808-acbd-4fd3-b998-7b14d6cbb569	ส้อมปลา	Fish Fork	cutlery	\N	รับประทานปลา	\N	Use the fish fork along with the fish knife.	\N	\N	\N	\N	/fɪʃ fɔːk/	\N	2026-08-26 19:02:22.324127+07	Use the fish fork along with the fish knife.
b4b921a9-d164-4928-adbe-aa819645f4ce	ช้อนของหวาน	Dessert Spoon	cutlery	\N	รับประทานของหวาน	\N	The dessert spoon is served with puddings and cakes.	\N	\N	\N	\N	/dɪˈzɜːt spuːn/	\N	2026-08-26 19:02:22.324127+07	The dessert spoon is served with puddings and cakes.
a8b68576-5152-42a3-b11b-84c5f6c1cfa5	ส้อมของหวาน	Dessert Fork	cutlery	\N	รับประทานของหวาน	\N	Use the dessert fork for fruit or cake.	\N	\N	\N	\N	/dɪˈzɜːt fɔːk/	\N	2026-08-26 19:02:22.324127+07	Use the dessert fork for fruit or cake.
72039713-7f70-47ed-93fd-522038315058	ช้อนชา	Tea Spoon	cutlery	\N	คนชา กาแฟ	\N	Stir your hot tea gently with the tea spoon.	\N	\N	\N	\N	/tiː spuːn/	\N	2026-08-26 19:02:22.324127+07	Stir your hot tea gently with the tea spoon.
a9b73312-682a-4ebe-8e4b-7802b87ab12d	ช้อนกาแฟ	Coffee Spoon	cutlery	\N	คนกาแฟเอสเปรสโซ	\N	The coffee spoon is designed for small espresso cups.	\N	\N	\N	\N	/ˈkɒfi spuːn/	\N	2026-08-26 19:02:22.324127+07	The coffee spoon is designed for small espresso cups.
2d8eeb40-4cd3-4a65-a6ca-435f82b44531	แก้วน้ำเปล่า	Water Goblet	glassware	\N	ใช้สำหรับบริการน้ำเปล่า	\N	Water goblet is filled with ice water.	\N	\N	\N	\N	/ˈwɔːtər ˈɡɒblət/	\N	2026-08-26 19:02:22.324127+07	Water goblet is filled with ice water.
d1aa6803-ae5c-4d98-bb1a-f1eec3c6f497	แก้วไวน์แดง	Red Wine Glass	glassware	\N	บริการไวน์แดง	\N	Red wine glass has a large, round bowl.	\N	\N	\N	\N	/red waɪn ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	Red wine glass has a large, round bowl.
f68372e4-6d87-4514-8abe-3237f6a7b9ff	แก้วไวน์ขาว	White Wine Glass	glassware	\N	บริการไวน์ขาว	\N	White wine glass is smaller to preserve chilled temperature.	\N	\N	\N	\N	/waɪt waɪn ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	White wine glass is smaller to preserve chilled temperature.
575d17d1-96ac-455d-b603-3c57f226af49	แก้วแชมเปญ	Champagne Flute	glassware	\N	บริการแชมเปญ	\N	Champagne flute keeps bubbles sparkling longer.	\N	\N	\N	\N	/ʃæmˈpeɪn fluːt/	\N	2026-08-26 19:02:22.324127+07	Champagne flute keeps bubbles sparkling longer.
9c7d0425-5c57-42b8-a1bb-75d97048cd27	แก้วค็อกเทล	Cocktail Glass	glassware	\N	บริการค็อกเทล	\N	Cocktail glass is classic V-shaped glass.	\N	\N	\N	\N	/ˈkɒkteɪl ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	Cocktail glass is classic V-shaped glass.
ad52a753-f577-466c-90f5-66df2847cc5c	แก้วไฮบอล	Highball Glass	glassware	\N	บริการเครื่องดื่มผสม	\N	Highball glass is used for long drinks and juices.	\N	\N	\N	\N	/ˈhaɪbɔːl ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	Highball glass is used for long drinks and juices.
76a78133-8889-45c4-98c6-de024759a10f	แก้วร็อกส์	Rocks Glass	glassware	\N	บริการวิสกี้	\N	Rocks glass is used for spirits served on the rocks.	\N	\N	\N	\N	/rɒks ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	Rocks glass is used for spirits served on the rocks.
b57be6a3-6604-42db-80ff-078211f447a7	แก้วเบียร์	Beer Glass	glassware	\N	บริการเบียร์	\N	Pour beer carefully into the beer glass.	\N	\N	\N	\N	/bɪər ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	Pour beer carefully into the beer glass.
8da19c8b-d72a-4936-9afa-b67004580f60	แก้วบรั่นดี	Brandy Snifter	glassware	\N	บริการบรั่นดี	\N	Hold the brandy snifter in your palm to warm it.	\N	\N	\N	\N	/ˈbrændi ˈsnɪf.tər/	\N	2026-08-26 19:02:22.324127+07	Hold the brandy snifter in your palm to warm it.
9d5c89f8-9f91-4616-9e56-e3d8a4d40232	แก้วมาร์ตินี	Martini Glass	glassware	\N	บริการมาร์ตินี	\N	Serve chilled Martini in a martini glass with an olive.	\N	\N	\N	\N	/mɑːˈtiːni ɡlɑːs/	\N	2026-08-26 19:02:22.324127+07	Serve chilled Martini in a martini glass with an olive.
576c4cf0-f2ff-4f26-8506-d6e5c8f82e4d	ผ้าปูโต๊ะ	Table Cloth	linen	\N	ปูโต๊ะอาหาร	\N	The table cloth must be clean and unwrinkled.	\N	\N	\N	\N	/ˈteɪbl klɒθ/	\N	2026-08-26 19:02:22.324127+07	The table cloth must be clean and unwrinkled.
c05f0f8a-6e5c-412f-bee8-0f8df5066be0	ผ้ารองโต๊ะ	Under Cloth	linen	\N	รองผ้าปูโต๊ะเพื่อลดเสียง	\N	Under cloth absorbs noise and softens the table surface.	\N	\N	\N	\N	/ˈʌndər klɒθ/	\N	2026-08-26 19:02:22.324127+07	Under cloth absorbs noise and softens the table surface.
5379588b-3ab7-4d3c-80c3-43bf79861fca	ผ้าเช็ดปาก	Napkin	linen	\N	เช็ดปากและตกแต่งโต๊ะ	\N	Fold the napkin neatly on the guest plate.	\N	\N	\N	\N	/ˈnæpkɪn/	\N	2026-08-26 19:02:22.324127+07	Fold the napkin neatly on the guest plate.
62c3e29b-4b28-4532-91c2-8ed161b32809	ผ้าคลุมถาด	Tray Cloth	linen	\N	รองถาดเสิร์ฟกันลื่น	\N	Place a tray cloth to prevent glasses from slipping.	\N	\N	\N	\N	/treɪ klɒθ/	\N	2026-08-26 19:02:22.324127+07	Place a tray cloth to prevent glasses from slipping.
3b31a11a-3c63-484e-8185-47871f5064a1	ผ้าเช็ดแก้ว	Glass Cloth	linen	\N	เช็ดทำความสะอาดแก้ว	\N	Polishing glasses with a lint-free glass cloth.	\N	\N	\N	\N	/ɡlɑːs klɒθ/	\N	2026-08-26 19:02:22.324127+07	Polishing glasses with a lint-free glass cloth.
42a8be8c-6708-4a6d-a98c-9ca2c93020c9	ผ้าเช็ดเครื่องเงิน	Polishing Cloth	linen	\N	เช็ดเครื่องเงินและช้อนส้อม	\N	Use polishing cloth for shiny flatware.	\N	\N	\N	\N	/ˈpɒlɪʃɪŋ klɒθ/	\N	2026-08-26 19:02:22.324127+07	Use polishing cloth for shiny flatware.
658ee427-cf48-4147-a924-abafcb227be6	ขวดเกลือ	Salt Shaker	condiments	\N	ใส่เกลือปรุงรส	\N	Salt shaker is placed next to pepper shaker.	\N	\N	\N	\N	/sɔːlt ˈʃeɪkər/	\N	2026-08-26 19:02:22.324127+07	Salt shaker is placed next to pepper shaker.
7a90b55e-7357-43a8-b675-146ae4a1f282	ขวดพริกไทย	Pepper Shaker	condiments	\N	ใส่พริกไทยปรุงรส	\N	Offer fresh pepper shaker to guests.	\N	\N	\N	\N	/ˈpepər ˈʃeɪkər/	\N	2026-08-26 19:02:22.324127+07	Offer fresh pepper shaker to guests.
e9a3fd0f-a406-426c-909c-2b68a4fdc1d5	โถน้ำตาล	Sugar Bowl	condiments	\N	ใส่น้ำตาล	\N	Sugar bowl is served with coffee and tea service.	\N	\N	\N	\N	/ˈʃʊɡər bəʊl/	\N	2026-08-26 19:02:22.324127+07	Sugar bowl is served with coffee and tea service.
8314d41f-b2f1-49b3-9eb9-55661965faab	ขวดซอส	Sauce Bottle	condiments	\N	ใส่ซอสปรุงรส	\N	Sauce bottle provides extra flavor for meals.	\N	\N	\N	\N	/sɔːs ˈbɒtl/	\N	2026-08-26 19:02:22.324127+07	Sauce bottle provides extra flavor for meals.
223417ef-267e-4c30-8d59-ccb362acb2b2	ขวดน้ำส้มสายชู	Vinegar Bottle	condiments	\N	ใส่น้ำส้มสายชู	\N	Vinegar bottle is part of salad dressing condiments.	\N	\N	\N	\N	/ˈvɪnɪɡər ˈbɒtl/	\N	2026-08-26 19:02:22.324127+07	Vinegar bottle is part of salad dressing condiments.
3cb82bf1-51ec-43cb-8657-8cd60948b117	ขวดน้ำมันมะกอก	Olive Oil Bottle	condiments	\N	ใส่น้ำมันมะกอก	\N	Serve extra virgin olive oil bottle with bread.	\N	\N	\N	\N	/ˈɒlɪv ɔɪl ˈbɒtl/	\N	2026-08-26 19:02:22.324127+07	Serve extra virgin olive oil bottle with bread.
5fce2cd8-5749-4f85-aaef-8113ac119a8c	ถาดเสิร์ฟอาหาร	Service Tray	service	\N	เสิร์ฟอาหาร	\N	Carry food items safely using a service tray.	\N	\N	\N	\N	/ˈsɜːvɪs treɪ/	\N	2026-08-26 19:02:22.324127+07	Carry food items safely using a service tray.
cc4da626-2a0c-40a0-9fb8-12a9d2d4c9c7	ถาดเครื่องดื่ม	Beverage Tray	service	\N	เสิร์ฟเครื่องดื่ม	\N	Beverage tray should be held with one hand from below.	\N	\N	\N	\N	/ˈbevərɪdʒ treɪ/	\N	2026-08-26 19:02:22.324127+07	Beverage tray should be held with one hand from below.
58ba35f6-fa14-4f60-a98d-229a14a024cf	ถาดกลม	Round Tray	service	\N	เสิร์ฟอาหารและแก้วน้ำ	\N	Round tray is standard for beverage service.	\N	\N	\N	\N	/raʊnd treɪ/	\N	2026-08-26 19:02:22.324127+07	Round tray is standard for beverage service.
04bd74e0-5a59-41ca-b3fc-82f7df095e81	ถาดสี่เหลี่ยม	Rectangular Tray	service	\N	เสิร์ฟอาหารจานใหญ่	\N	Rectangular tray carries multiple plates easily.	\N	\N	\N	\N	/rekˈtæŋɡjələr treɪ/	\N	2026-08-26 19:02:22.324127+07	Rectangular tray carries multiple plates easily.
75d671a3-284e-4e3d-9f18-9593d3927329	เหยือกน้ำ	Water Pitcher	service	\N	เติมน้ำเปล่า	\N	Refill guests water glasses with water pitcher.	\N	\N	\N	\N	/ˈwɔːtər ˈpɪtʃər/	\N	2026-08-26 19:02:22.324127+07	Refill guests water glasses with water pitcher.
b58d4a3e-800e-4db9-a11c-041bd1e4e102	เหยือกกาแฟ	Coffee Pot	service	\N	เสิร์ฟกาแฟร้อน	\N	Pour hot coffee carefully from the coffee pot.	\N	\N	\N	\N	/ˈkɒfi pɒt/	\N	2026-08-26 19:02:22.324127+07	Pour hot coffee carefully from the coffee pot.
0b3c92af-a53d-47ce-a41e-e80f8fce25bb	กาน้ำชา	Tea Pot	service	\N	เสิร์ฟชาร้อน	\N	Tea pot holds hot water for steeping tea.	\N	\N	\N	\N	/tiː pɒt/	\N	2026-08-26 19:02:22.324127+07	Tea pot holds hot water for steeping tea.
f74b4017-f428-44c5-a84d-fb804b40647a	ถังน้ำแข็ง	Ice Bucket	service	\N	แช่ไวน์และใส่น้ำแข็ง	\N	Ice bucket keeps wine bottles nicely chilled.	\N	\N	\N	\N	/aɪs ˈbʌkɪt/	\N	2026-08-26 19:02:22.324127+07	Ice bucket keeps wine bottles nicely chilled.
1475dc14-8f10-4064-a37f-8494f36cccdd	คีมคีบน้ำแข็ง	Ice Tong	service	\N	คีบน้ำแข็ง	\N	Pick up ice cubes hygienically with ice tong.	\N	\N	\N	\N	/aɪs tɒŋ/	\N	2026-08-26 19:02:22.324127+07	Pick up ice cubes hygienically with ice tong.
d6724a81-474f-4c5c-961e-781b11af514e	ที่เปิดไวน์	Wine Opener	service	\N	เปิดขวดไวน์	\N	Servers should carry a wine opener at all times.	\N	\N	\N	\N	/waɪn ˈəʊpnər/	\N	2026-08-26 19:02:22.324127+07	Servers should carry a wine opener at all times.
14631757-e3b9-40e5-92f8-4c6ec751387d	ตะกร้าไวน์	Wine Basket	beverage	\N	วางขวดไวน์แดงวินเทจ	\N	Wine basket presents aged red wine horizontally.	\N	\N	\N	\N	/waɪn ˈbɑːskɪt/	\N	2026-08-26 19:02:22.324127+07	Wine basket presents aged red wine horizontally.
2f2ed62c-84f5-4386-81a1-f1d02e797841	ถังแช่ไวน์	Wine Cooler	beverage	\N	แช่ไวน์ให้เย็น	\N	Keep white wine cold in a wine cooler filled with ice.	\N	\N	\N	\N	/waɪn ˈkuːlər/	\N	2026-08-26 19:02:22.324127+07	Keep white wine cold in a wine cooler filled with ice.
51a17c6a-97c3-42f1-bc2c-75fa7394a7cd	จุกปิดขวดไวน์	Wine Stopper	beverage	\N	ปิดขวดไวน์เพื่อรักษาคุณภาพ	\N	Seal opened wine bottle with a wine stopper.	\N	\N	\N	\N	/waɪn ˈstɒpər/	\N	2026-08-26 19:02:22.324127+07	Seal opened wine bottle with a wine stopper.
ff57cfbb-9c5a-4d6d-8c91-b3dc210ff6ae	เครื่องรินไวน์	Wine Pourer	beverage	\N	รินไวน์ไม่ให้หยดเลอะเทอะ	\N	Wine pourer prevents dripping on the tablecloth.	\N	\N	\N	\N	/waɪn ˈpɔːrər/	\N	2026-08-26 19:02:22.324127+07	Wine pourer prevents dripping on the tablecloth.
d4acbd91-ea97-49f6-9890-a6492d20c644	ที่เปิดขวด	Bottle Opener	beverage	\N	เปิดฝาขวดเครื่องดื่ม	\N	Use bottle opener for soda and beer bottles.	\N	\N	\N	\N	/ˈbɒtl ˈəʊpnər/	\N	2026-08-26 19:02:22.324127+07	Use bottle opener for soda and beer bottles.
139681b1-3081-4d91-9e70-a94f535ae344	ที่เปิดไวน์แบบเกลียว	Corkscrew	beverage	\N	ถอดจุกคอร์กขวดไวน์	\N	Insert corkscrew into the center of cork.	\N	\N	\N	\N	/ˈkɔːkskruː/	\N	2026-08-26 19:02:22.324127+07	Insert corkscrew into the center of cork.
70502b4a-0132-4517-aec8-75aee6639102	รถเข็นบริการ	Gueridon Trolley	gueridon	\N	เตรียมและปรุงอาหารต่อหน้าลูกค้าที่โต๊ะ	\N	Gueridon trolley is used for side-table cooking service.	\N	\N	\N	\N	/ˈɡerɪdɒn ˈtrɒli/	\N	2026-08-26 19:02:22.324127+07	Gueridon trolley is used for side-table cooking service.
78596eb7-3a32-44a8-ab8f-81e80f2f252e	เตาแอลกอฮอล์	Spirit Lamp	gueridon	\N	ให้ความร้อนบนรถเข็น	\N	Spirit lamp provides flame for flambé dishes.	\N	\N	\N	\N	/ˈspɪrɪt læmp/	\N	2026-08-26 19:02:22.324127+07	Spirit lamp provides flame for flambé dishes.
350f1f7a-ecb7-4e3a-aabb-eb2174f9c5b9	กระทะฟลอมเบ	Flambé Pan	gueridon	\N	ทำอาหารฟลอมเบ (ราดเหล้าจุดไฟ)	\N	Prepare Crepe Suzette using a flambé pan.	\N	\N	\N	\N	/flɒmˈbeɪ pæn/	\N	2026-08-26 19:02:22.324127+07	Prepare Crepe Suzette using a flambé pan.
135b598f-96f1-4e8c-b0a6-e97bfdf3feb3	เขียงเตรียมอาหาร	Cutting Board	gueridon	\N	แล่เนื้อหรือหั่นเตรียมอาหาร	\N	Carve roasted meat on a clean cutting board.	\N	\N	\N	\N	/ˈkʌtɪŋ bɔːd/	\N	2026-08-26 19:02:22.324127+07	Carve roasted meat on a clean cutting board.
9652e20e-dfa0-4473-ac24-8466f184b03a	มีดเชฟ	Chef's Knife	gueridon	\N	หั่นและตัดแล่ส่วนผสม	\N	Chef's knife cuts meat smoothly for serving.	\N	\N	\N	\N	/ʃefs naɪf/	\N	2026-08-26 19:02:22.324127+07	Chef's knife cuts meat smoothly for serving.
23c6c347-c84d-4292-8d4b-8cfd133d3582	คีมคีบอาหารบริการ	Serving Tong	gueridon	\N	คีบอาหารเสิร์ฟลูกค้า	\N	Transfer food onto guest plates using serving tong.	\N	\N	\N	\N	/ˈsɜːvɪŋ tɒŋ/	\N	2026-08-26 19:02:22.324127+07	Transfer food onto guest plates using serving tong.
3a104d06-b35d-4365-8a13-db8145db63cf	เชิงเทียน	Candle Holder	accessories	\N	วางเทียนตกแต่งโต๊ะอาหาร	\N	Candle holder adds romantic atmosphere to dinner.	\N	\N	\N	\N	/ˈkændl ˈhəʊldər/	\N	2026-08-26 19:02:22.324127+07	Candle holder adds romantic atmosphere to dinner.
fbdd4745-4c4c-47c5-aa41-9830b4c0f73f	แจกันดอกไม้	Flower Vase	accessories	\N	ตกแต่งโต๊ะอาหาร	\N	Flower vase centerpieces should not block guest eye lines.	\N	\N	\N	\N	/ˈflaʊər vɑːz/	\N	2026-08-26 19:02:22.324127+07	Flower vase centerpieces should not block guest eye lines.
63221302-d7f3-4bef-b726-e8eaaa938628	ป้ายหมายเลขโต๊ะ	Table Number	accessories	\N	ระบุหมายเลขโต๊ะอาหาร	\N	Table number helps servers identify guest tables.	\N	\N	\N	\N	/ˈteɪbl ˈnʌmbər/	\N	2026-08-26 19:02:22.324127+07	Table number helps servers identify guest tables.
af01210a-279e-4d9c-a662-0493a9ef4bca	การ์ดเมนู	Menu Card	accessories	\N	แสดงรายการอาหารและเครื่องดื่ม	\N	Present the menu card from the right side of guest.	\N	\N	\N	\N	/ˈmenjuː kɑːd/	\N	2026-08-26 19:02:22.324127+07	Present the menu card from the right side of guest.
e243fce1-41ac-47a9-8c39-0dbe7bf75a30	แผ่นจานรอง	Charger Plate	accessories	\N	รองจานอาหารเพื่อความสวยงาม	\N	Charger plate remains on table until main course.	\N	\N	\N	\N	/ˈtʃɑːdʒər pleɪt/	\N	2026-08-26 19:02:22.324127+07	Charger plate remains on table until main course.
0b22237c-5cde-4029-96b2-2db75916a2a3	ที่รองแก้ว	Coaster	accessories	\N	รองแก้วเครื่องดื่ม	\N	Place a coaster under cold drink glasses.	\N	\N	\N	\N	/ˈkəʊstər/	\N	2026-08-26 19:02:22.324127+07	Place a coaster under cold drink glasses.
535a5955-3aa0-4a74-935b-95aa789de389	ตู้เก็บอุปกรณ์	Sideboard	side_station	\N	เก็บสำรองอุปกรณ์บริการ	\N	Sideboard holds extra cutlery, napkins and glasses.	\N	\N	\N	\N	/ˈsaɪdbɔːd/	\N	2026-08-26 19:02:22.324127+07	Sideboard holds extra cutlery, napkins and glasses.
6b91087b-acb9-476d-aec2-5429e29693d4	ถังเก็บช้อนส้อม	Cutlery Holder	side_station	\N	จัดเก็บช้อนส้อมเป็นหมวดหมู่	\N	Keep clean spoons and forks sorted in cutlery holder.	\N	\N	\N	\N	/ˈkʌtləri ˈhəʊldər/	\N	2026-08-26 19:02:22.324127+07	Keep clean spoons and forks sorted in cutlery holder.
d08bcf85-dfeb-488f-8e37-149cca00a75c	ถังขยะบริการ	Waste Bin	side_station	\N	ทิ้งขยะเศษวัสดุ	\N	Keep waste bin hidden inside side station cabinet.	\N	\N	\N	\N	/weɪst bɪn/	\N	2026-08-26 19:02:22.324127+07	Keep waste bin hidden inside side station cabinet.
56a13222-1169-44fa-8582-8d178313922e	ถังเก็บน้ำแข็ง	Ice Bin	side_station	\N	เก็บสำรองน้ำแข็งสะอาด	\N	Ice bin stores ice for beverage service.	\N	\N	\N	\N	/aɪs bɪn/	\N	2026-08-26 19:02:22.324127+07	Ice bin stores ice for beverage service.
08b76bbd-edb4-4119-9c69-400c9686f48a	ถาดเก็บจาน	Plate Rack	side_station	\N	จัดเก็บจานอาหาร	\N	Stack clean plates carefully in the plate rack.	\N	\N	\N	\N	/pleɪt ræk/	\N	2026-08-26 19:02:22.324127+07	Stack clean plates carefully in the plate rack.
0b47fac9-a8f5-4599-bc72-8c98b93c4ead	ตะกร้าเก็บผ้า	Linen Basket	side_station	\N	เก็บผ้าเช็ดปากและผ้าปูโต๊ะที่ใช้แล้ว	\N	Place used napkins in the linen basket.	\N	\N	\N	\N	/ˈlɪnɪn ˈbɑːskɪt/	\N	2026-08-26 19:02:22.324127+07	Place used napkins in the linen basket.
\.


--
-- Data for Name: api_rate_limits; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.api_rate_limits (bucket_key, request_count, expires_at) FROM stdin;
::1:/api/auth/login:60000:29826129	1	2026-09-16 21:10:00+07
\.


--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.app_users (id, email, password_hash, created_at, updated_at, session_version) FROM stdin;
00000000-0000-0000-0000-000000000001	admin@local.test	$2a$12$Vexly4zNMPhBVeUdpBsdreKjgWxIH52DH5vNsPhr4QAWxWBWQQyEO	2026-08-26 18:06:42.176583+07	2026-08-26 18:06:42.176583+07	1
00000000-0000-0000-0000-000000000003	student@local.test	$2a$12$5m281fpsBliOZPvhfb2FG.oQ5ep/AtV6UXlgXF6TqawVODEaePBQO	2026-08-26 18:08:58.249032+07	2026-08-26 18:08:58.249032+07	1
00000000-0000-0000-0000-000000000002	teacher@local.test	$2a$12$2wArtwSjOi/d2LZQumEBf.lGiOoDkPM1JIv02JFSxbws98Hdo..1i	2026-08-26 18:08:58.249032+07	2026-08-26 18:08:58.249032+07	1
3ee2ad72-7942-4374-9d13-ae801096bf97	mailpit-test-9bfd836f92@local.test	$2b$12$mN6H8L4Msn1wnpjrGKhAouWpRBwWUQVNzdnX0q/k0qA9wLqrGVb.W	2026-09-14 17:49:04.85673+07	2026-09-14 17:49:04.85673+07	1
00000000-0000-0000-0000-000000000020	krupim@ktc.ac.th	$2a$12$OWdWJkmA1t45YISSC/NOPuiBLdXiDrzJsi0BhXsrQxiRCCpM0OuvO	2026-09-16 10:13:29.118983+07	2026-09-16 10:13:29.118983+07	1
\.


--
-- Data for Name: ar_items; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.ar_items (id, name_en, name_th, pronounce, sentence, description, image_url, glb_url, usdz_url, blender_script, created_by, created_at, updated_at) FROM stdin;
ar-a3c4eee0-9b1d-47e2-9aaf-f6bc64529572	Appetizer Plate	จานเรียกน้ำย่อย / จานอาหารว่าง	แอพ-พิ-ไท-เซอร์ เพลท	Please place the appetizer plate on the table before the main course.	จานขนาดเล็กสำหรับใส่ของว่างหรืออาหารเรียกน้ำย่อยก่อนเสิร์ฟอาหารจานหลัก	data:image/png;base64,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	/uploads/1787748503090_Appetizer_Plate01_glb_a8d4443bfa8b.glb	/uploads/1787748506856_Appetizer_Plate01_usdz_32f8f7e19e1d.usdz	\N	00000000-0000-0000-0000-000000000002	2026-08-26 19:48:28.452673+07	2026-08-26 19:51:50.970226+07
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.assessments (id, course_id, unit_id, title, description, rubric_json, max_score, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.assignment_submissions (id, assignment_id, student_id, score, feedback, attachment_name, attachment_url, submitted_at, graded_at, status, return_reason, returned_at) FROM stdin;
b1111111-1111-4111-8111-111111111101	a1111111-1111-4111-8111-111111111101	00000000-0000-0000-0000-000000000003	\N	\N	tableware_scan_record.jpg	/uploads/samples/ai_scan_record.jpg	2026-09-16 09:15:25.621191+07	\N	submitted	\N	\N
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.assignments (id, class_id, teacher_id, title, description, activity_type, lesson_id, scenario_id, due_date, max_score, created_at, updated_at, lesson_plan_id) FROM stdin;
a1111111-1111-4111-8111-222222222201	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 2 [F]: ใบงาน Worksheet & AI Scan รายการอาหารและเครื่องดื่ม 20 ชนิด	ให้นักเรียนสแกนดูโมเดล 3D และทำใบงานจับคู่คำศัพท์ประเภทอาหารและเครื่องดื่ม (Appetizers, Main Courses, Desserts, Beverages) จำนวน 20 ชนิด พร้อมใช้ฟีเจอร์ AI Scan สแกนภาพหรือโมเดลอาหารจำลองและบันทึกผลลงใน AI Scan Learning Record	Familiarize	\N	\N	2026-09-30 17:25:30.285413+07	20	2026-09-16 17:13:50.143451+07	2026-09-16 17:13:50.143451+07	lesson-plan-week-2
a1111111-1111-4111-8111-222222222202	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 2 [I]: ฝึกพูดและแต่งประโยคจำแนกประเภทเมนูอาหารกับ AI Voice	ให้นักเรียนฝึกออกเสียงคำศัพท์และพูดประโยคจำแนกประเภทเมนูตามโครงสร้าง "[Dish/Drink Name] is categorized as [Category]." ผ่านระบบ AI Voice เพื่อรับคำแนะนำด้านสำเนียง ความถูกต้อง และการเน้นเสียง (Stress)	Interact	\N	\N	2026-09-30 17:25:30.285413+07	20	2026-09-16 17:13:50.143451+07	2026-09-16 17:13:50.143451+07	lesson-plan-week-2
a1111111-1111-4111-8111-111111111101	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 11 [F]: ใบงาน Worksheet ขั้นตอนและโครงสร้างประโยค Confirming Orders Sheet	ให้นักเรียนสแกน QR Code ศึกษา Flowchart Interactive ลำดับการทวนออเดอร์ ทำใบงานจัดหมวดหมู่ประโยคตามลำดับการเสิร์ฟ (Appetizer -> Main Course -> Dessert -> Beverage) และเติมคำศัพท์เงื่อนไขพิเศษ เช่น Dressing on the side, No MSG	Familiarize	\N	\N	2026-12-02 18:12:27.627677+07	20	2026-09-16 11:15:25.621191+07	2026-09-16 11:15:25.621191+07	lesson-plan-week-11
a1111111-1111-4111-8111-111111111102	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 11 [I]: ฝึกทักษะการทวนออเดอร์และการรับมือเมื่อลูกค้าเปลี่ยนใจผ่าน Gemini Live	ให้นักเรียนเปิดใช้ Gemini Live ผ่าน web app FINE Model ฝึกซ้อม 2 ภารกิจ: 1) Order Checking Mode ทวนรายการอาหารชุดใหญ่ที่มีเงื่อนไขซับซ้อน 2) Order Modification Challenge รับมือเมื่อ AI เปลี่ยนแปลงออเดอร์กลางคัน พร้อมบันทึกลงใน AI Learning Record	Interact	\N	\N	2026-12-02 18:12:27.627677+07	20	2026-09-16 11:15:25.621191+07	2026-09-16 11:15:25.621191+07	lesson-plan-week-11
a1111111-1111-4111-8111-111111111103	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 11 [N]: สถานการณ์จำลอง Restaurant Simulation ทวนออเดอร์แบบ Outside-In	แบ่งกลุ่มสวมบทบาทพนักงานบริการและลูกค้า ฝึกรับออเดอร์และทวนรายการตามแบบแผน Outside-In ตามลำดับอาหาร พร้อมตรวจสอบความถูกต้องบนใบสั่งอาหารจำลอง (Mock Order Sheet) และรับมือสถานการณ์ลูกค้าทักท้วงอย่างสุภาพ	Navigate	\N	\N	2026-12-02 18:12:27.627677+07	20	2026-09-16 11:15:25.621191+07	2026-09-16 11:15:25.621191+07	lesson-plan-week-11
a1111111-1111-4111-8111-111111111104	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 11 [E]: สาธิตการทวนออเดอร์สด, แบบทดสอบออนไลน์ และส่ง Exit Ticket	สุ่มตัวแทนสาธิตการทวนออเดอร์สดหน้าห้องเรียน เน้นน้ำเสียงและความชัดเจนในการแจ้งเวลารออาหาร, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Confirming Orders และเขียน Exit Ticket ระบุ 3 ประโยคสำคัญพร้อม 1 ประสบการณ์จาก Gemini Live	Exhibit	\N	\N	2026-12-02 18:12:27.627677+07	20	2026-09-16 11:15:25.621191+07	2026-09-16 11:15:25.621191+07	lesson-plan-week-11
a1111111-1111-4111-8111-222222222203	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 2 [N]: ภารกิจจำลองการจัดระเบียบเมนูห้องอาหาร The Menu Master Challenge	ให้นักเรียนร่วมกันจัดหมวดหมู่และคัดแยกรายการอาหารและเครื่องดื่มลงบนบอร์ดจำลองโครงสร้างเมนูห้องอาหาร (Restaurant Menu Board) ตามมาตรฐานสากล (Appetizers -> Main Courses -> Desserts -> Beverages) พร้อมวิเคราะห์เมนูฟิวชั่น	Navigate	\N	\N	2026-09-30 17:25:30.285413+07	20	2026-09-16 17:13:50.143451+07	2026-09-16 17:13:50.143451+07	lesson-plan-week-2
a1111111-1111-4111-8111-222222222204	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 2 [E]: กิจกรรม Exit Ticket สรุปองค์ประกอบเมนู และ Quiz ประจำสัปดาห์ที่ 2	ให้นักเรียนทำ Quiz ทดสอบความรู้เรื่องการจำแนกประเภทเมนูอาหารและเครื่องดื่ม พร้อมพิมพ์สรุปองค์ประกอบเมนูอาหารจานหลัก 2 เมนู, ของหวาน 2 เมนู และเครื่องดื่ม 1 เมนู เป็นภาษาอังกฤษในกิจกรรม Exit Ticket	Exhibit	\N	\N	2026-09-30 17:25:30.285413+07	20	2026-09-16 17:13:50.143451+07	2026-09-16 17:13:50.143451+07	lesson-plan-week-2
a1111111-1111-4111-8111-333333333301	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 3 [F]: ใบงาน Worksheet & AI Scan ผังการจัดโต๊ะอาหาร Casual & Formal	ให้นักเรียนสแกนดูผังโมเดล 3D Table Setting แบบ Casual และ Formal พร้อมทำใบงานจับคู่คำศัพท์และตำแหน่งอุปกรณ์ และใช้ AI Scan สแกนโต๊ะอาหารตัวอย่างในห้องปฏิบัติการเพื่อบันทึกผลลงใน AI Scan Learning Record (Table Setting Edition)	Familiarize	\N	\N	2026-10-07 17:34:09.962469+07	20	2026-09-16 17:34:09.962469+07	2026-09-16 17:34:09.962469+07	lesson-plan-week-3
a1111111-1111-4111-8111-333333333302	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 3 [I]: ฝึกพูดและแต่งประโยคระบุตำแหน่งการจัดโต๊ะกับ AI Voice & Gemini Live	ให้นักเรียนฝึกออกเสียงคำศัพท์และแต่งประโยคระบุตำแหน่งอุปกรณ์การจัดโต๊ะ เช่น "The Dinner Knife goes on the right side of the plate." พร้อมจับคู่ Pair Work สลับบทบาทเป็นผู้สั่งและผู้จัดวางอุปกรณ์จริงบนโต๊ะโดยใช้ Gemini Live ตรวจสอบสำเนียง	Interact	\N	\N	2026-10-07 17:34:09.962469+07	20	2026-09-16 17:34:09.962469+07	2026-09-16 17:34:09.962469+07	lesson-plan-week-3
a1111111-1111-4111-8111-333333333303	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 3 [N]: ภารกิจจำลองการจัดโต๊ะอาหาร Table Setting Simulation Challenge	ให้นักเรียนแบ่งทีมร่วมแข่งขันจำลองการจัดโต๊ะอาหารตามโจทย์สถานการณ์จำลอง (Formal Western 4 คอร์ส หรือ Casual Dining) จัดวางอุปกรณ์ตามกฎ 1 นิ้ว และ Outside-In พร้อมแก้ไขจุดผิดพลาดที่ครูจำลองโจทย์ปัญหาท้าทาย (Problem-Solving)	Navigate	\N	\N	2026-10-07 17:34:09.962469+07	20	2026-09-16 17:34:09.962469+07	2026-09-16 17:34:09.962469+07	lesson-plan-week-3
a1111111-1111-4111-8111-333333333304	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 3 [E]: กิจกรรม Exit Ticket สรุปกฎ 3 ข้อ และ Quiz ประจำสัปดาห์ที่ 3	ให้ตัวแทนนำเสนอผลงานจัดโต๊ะเป็นภาษาอังกฤษ, ผู้เรียนทุกคนทำ Quiz ออนไลน์ทดสอบความเข้าใจ Table Setting Rules & Layouts และเขียน Exit Ticket สรุปกฎการจัดโต๊ะภาษาอังกฤษ 3 ข้อส่งก่อนจบคลาส	Exhibit	\N	\N	2026-10-07 17:34:09.962469+07	20	2026-09-16 17:34:09.962469+07	2026-09-16 17:34:09.962469+07	lesson-plan-week-3
a1111111-1111-4111-8111-444444444401	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 4 [F]: ใบงาน Worksheet & AI Scan อุปกรณ์บริการ 5 หมวด Service Equipment	ให้นักเรียนสแกนดูโมเดล 3D อุปกรณ์บริการทั้ง 5 หมวด (Chinaware, Cutlery, Glassware, Linen, Hollowware) พร้อมทำใบงานจับคู่คำศัพท์และหน้าที่ และใช้ฟีเจอร์ AI Scan สแกนอุปกรณ์จริงเพื่อบันทึกผลลงใน AI Scan Learning Record (Equipment Edition)	Familiarize	\N	\N	2026-10-14 17:40:25.447206+07	20	2026-09-16 17:40:25.447206+07	2026-09-16 17:40:25.447206+07	lesson-plan-week-4
a1111111-1111-4111-8111-444444444402	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 4 [I]: ฝึกพูดระบุหน้าที่และหลักการจับถืออุปกรณ์กับ AI Voice	ให้นักเรียนฝึกออกเสียงคำศัพท์และประโยคภาษาอังกฤษระบุหน้าที่และหลักสุขอนามัยในการจับถืออุปกรณ์ เช่น "Always hold the wine glass by the stem to keep it clean and maintain the wine temperature." พร้อมจับคู่สลับบทบาทเป็น Head Server และ Junior Server	Interact	\N	\N	2026-10-14 17:40:25.447206+07	20	2026-09-16 17:40:25.447206+07	2026-09-16 17:40:25.447206+07	lesson-plan-week-4
a1111111-1111-4111-8111-444444444403	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 4 [N]: ภารกิจจำลองการคัดเลือกและ Polishing อุปกรณ์ Equipment Selection Challenge	ให้นักเรียนแบ่งทีมวางแผนเลือกอุปกรณ์ให้ตรงตามโจทย์รายการอาหาร 3 คอร์ส นำอุปกรณ์มาผ่านขั้นตอน Polishing ด้วยไอน้ำร้อนและผ้า Linen ให้เงางามไร้คราบ พร้อมคัดแยกอุปกรณ์ชำรุดหรือมีตำหนิออกจากคลังบริการ	Navigate	\N	\N	2026-10-14 17:40:25.447206+07	20	2026-09-16 17:40:25.447206+07	2026-09-16 17:40:25.447206+07	lesson-plan-week-4
a1111111-1111-4111-8111-444444444404	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 4 [E]: กิจกรรม Exit Ticket สุขอนามัยการจับถือ และ Quiz ประจำสัปดาห์ที่ 4	ให้ตัวแทนนำเสนออุปกรณ์และสาธิตการจับถืออย่างถูกสุขลักษณะเป็นภาษาอังกฤษ, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Service Equipment Rules & Identification และเขียน Exit Ticket ระบุจุดจับถือที่ถูกต้อง 3 ชนิดส่งก่อนออกจากห้องเรียน	Exhibit	\N	\N	2026-10-14 17:40:25.447206+07	20	2026-09-16 17:40:25.447206+07	2026-09-16 17:40:25.447206+07	lesson-plan-week-4
a1111111-1111-4111-8111-555555555501	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 5 [F]: ใบงาน Worksheet สำนวนการกล่าวต้อนรับและการแนะนำตนเอง	ให้นักเรียนทำแบบฝึกหัดเกี่ยวกับสำนวนการกล่าวต้อนรับตามช่วงเวลา การแนะนำตนเอง และการสอบถามข้อมูลการจองโต๊ะอาหาร พร้อมตอบคำถามเรื่องหลักการใช้ภาษาท่าทาง (Non-verbal Communication)	Familiarize	\N	\N	2026-10-21 17:42:58.063238+07	20	2026-09-16 17:42:58.063238+07	2026-09-16 17:42:58.063238+07	lesson-plan-week-5
a1111111-1111-4111-8111-555555555502	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 5 [I]: ฝึกสนทนาต้อนรับลูกค้าและรับ AI Feedback ผ่านระบบเสียง	ให้นักเรียนฝึกพูดกล่าวต้อนรับ แนะนำตนเอง และสอบถามการจองโต๊ะอาหารกับ AI Support ในระบบเว็บแอปแบบเรียลไทม์ พร้อมบันทึกคำแนะนำป้อนกลับด้านไวยากรณ์ ความเร็ว และสำเนียงลงในแบบบันทึก	Interact	\N	\N	2026-10-21 17:42:58.063238+07	20	2026-09-16 17:42:58.063238+07	2026-09-16 17:42:58.063238+07	lesson-plan-week-5
a1111111-1111-4111-8111-555555555503	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 5 [N]: สถานการณ์จำลอง Restaurant Simulation รับบทบาท Host/Server ต้อนรับลูกค้า 3 รูปแบบ	ให้นักเรียนสลับบทบาทเป็นพนักงานต้อนรับ (Host) และพนักงานบริการ (Server) ปฏิบัติการต้อนรับลูกค้าจริงตามการ์ดบทบาทสมมุติ (ลูกค้ารีบร้อน, ครอบครัว, ลูกค้าไม่จองล่วงหน้า) พร้อมแก้ไขสถานการณ์เฉพาะหน้า	Navigate	\N	\N	2026-10-21 17:42:58.063238+07	20	2026-09-16 17:42:58.063238+07	2026-09-16 17:42:58.063238+07	lesson-plan-week-5
a1111111-1111-4111-8111-555555555504	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 5 [E]: กิจกรรม Exit Ticket แก้ไขสถานการณ์เฉพาะหน้า และ Quiz สัปดาห์ที่ 5	ให้ตัวแทนแสดงบทบาทสมมุติการต้อนรับหน้าห้อง, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Greeting & Welcoming Expressions และเขียน Exit Ticket ประโยคต้อนรับตามบทบาทที่ได้รับส่งครูก่อนจบคลาส	Exhibit	\N	\N	2026-10-21 17:42:58.063238+07	20	2026-09-16 17:42:58.063238+07	2026-09-16 17:42:58.063238+07	lesson-plan-week-5
a1111111-1111-4111-8111-666666666601	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 6 [F]: ใบงาน Worksheet ขั้นตอนการนำนั่ง Seating Etiquette & Safe/Taboo Topics	ให้นักเรียนทำแบบฝึกหัดเกี่ยวกับขั้นตอนมารยาทการนำลูกค้านั่งโต๊ะ (Seating Etiquette) และการจำแนกหัวข้อที่เหมาะสม (Safe Topics) กับหัวข้อต้องห้าม (Taboo Topics) ในการทำ Small Talk	Familiarize	\N	\N	2026-10-28 17:49:44.110295+07	20	2026-09-16 17:49:44.110295+07	2026-09-16 17:49:44.110295+07	lesson-plan-week-6
a1111111-1111-4111-8111-666666666602	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 6 [I]: ฝึกสนทนา Small Talk ต่อเนื่อง 3-4 ประโยคกับ AI Support	ให้นักเรียนฝึกโต้ตอบบทสนทนาทั่วไป (Small Talk) ขณะเดินนำลูกค้าไปยังโต๊ะอาหารกับ AI ใน web app FINE Model ต่อเนื่องอย่างน้อย 3-4 ประโยค พร้อมบันทึกผลการประเมินความลื่นไหล (Fluency)	Interact	\N	\N	2026-10-28 17:49:44.110295+07	20	2026-09-16 17:49:44.110295+07	2026-09-16 17:49:44.110295+07	lesson-plan-week-6
a1111111-1111-4111-8111-666666666603	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 6 [N]: สถานการณ์จำลอง Restaurant Simulation ภารกิจนำนั่งและ Small Talk ตามโจทย์ท้าทาย	ให้นักเรียนแบ่งกลุ่มปฏิบัติการเดินนำทาง ผายมือ ดึงเก้าอี้ และชวนคุย Small Talk ตามโจทย์เฉพาะหน้า (เช่น พาลูกค้าผู้สูงอายุเดินช้า หรือลูกค้าธุรกิจที่คุยโทรศัพท์) ในห้องปฏิบัติการ Restaurant Simulation	Navigate	\N	\N	2026-10-28 17:49:44.110295+07	20	2026-09-16 17:49:44.110295+07	2026-09-16 17:49:44.110295+07	lesson-plan-week-6
a1111111-1111-4111-8111-666666666604	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 6 [E]: กิจกรรม Exit Ticket สรุปหัวข้อ Small Talk 2 ประโยค และ Quiz สัปดาห์ที่ 6	ให้ตัวแทนแสดงการนำนั่งและทำ Small Talk หน้าชั้นเรียนโดยไม่ใช้สคริปต์, ผู้เรียนทุกคนทำ Quiz ออนไลน์ประจำสัปดาห์ที่ 6 และเขียน Exit Ticket ระบุหัวข้อ Small Talk 2 ประโยคที่มั่นใจส่งก่อนจบคลาส	Exhibit	\N	\N	2026-10-28 17:49:44.110295+07	20	2026-09-16 17:49:44.110295+07	2026-09-16 17:49:44.110295+07	lesson-plan-week-6
a1111111-1111-4111-8111-999999999902	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 9 [I]: ฝึกสนทนารับออเดอร์กับลูกค้า AI และรับคำแนะนำ Intonation/Grammar	ให้นักเรียนฝึกสนทนาโต้ตอบรับออเดอร์ผ่านเสียงจริงกับ AI ที่รับบทเป็นลูกค้าต่างชาติ ฝึกถามความสุกของเนื้อ เครื่องเคียง และน้ำสลัด พร้อมรับ Feedback เรื่องน้ำเสียงและไวยากรณ์	Interact	\N	\N	2026-11-18 18:05:59.816356+07	20	2026-09-16 18:05:59.816356+07	2026-09-16 18:05:59.816356+07	lesson-plan-week-9
a1111111-1111-4111-8111-777777777701	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 7 [F]: ใบงาน Worksheet & AI Scan การอธิบายลักษณะอาหารและวิธีปรุง The Master of Food Descriptions	ให้นักเรียนสแกนดูโมเดลอาหาร 3D Menu และใช้ AI Scan สแกนรายการอาหารเพื่อวิเคราะห์วัตถุดิบ (Ingredients) วิธีการปรุง (Cooking Methods) และคำคุณศัพท์อธิบายรสชาติ/เนื้อสัมผัส (Descriptive Words) บันทึกลงใน AI Scan Learning Record	Familiarize	\N	\N	2026-11-04 17:56:50.9582+07	20	2026-09-16 17:56:50.9582+07	2026-09-16 17:56:50.9582+07	lesson-plan-week-7
a1111111-1111-4111-8111-777777777702	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 7 [I]: ฝึกพูดอธิบายเมนูอาหาร ตอบข้อซักถามลูกค้ากับ AI Voice	ให้นักเรียนฝึกพูดอธิบายลักษณะอาหาร วิธีการปรุง และสารก่อภูมิแพ้เป็นภาษาอังกฤษโต้ตอบกับระบบ AI ใน web app FINE Model ที่รับบทเป็นลูกค้าต่างชาติสอบถามรายละเอียดเมนูอาหาร พร้อมรับผลประเมินสำเนียงและความคล่องแคล่ว	Interact	\N	\N	2026-11-04 17:56:50.9582+07	20	2026-09-16 17:56:50.9582+07	2026-09-16 17:56:50.9582+07	lesson-plan-week-7
a1111111-1111-4111-8111-777777777703	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 7 [N]: ภารกิจจำลอง Restaurant Simulation นำเสนอและแนะนำเมนูอาหาร Suggestive Selling	ให้นักเรียนร่วมกันระดมสมองและฝึกซ้อมการแนะนำเมนูอาหารจานเด็ด (Suggestive Selling) ตามโจทย์การ์ดสถานการณ์จำลอง (เช่น แนะนำสเต็กเนื้อนุ่มชุ่มฉ่ำ หรืออธิบายวัตถุดิบพาสต้าอาหารทะเล) พร้อมแสดงท่าทางประกอบอย่างมืออาชีพ	Navigate	\N	\N	2026-11-04 17:56:50.9582+07	20	2026-09-16 17:56:50.9582+07	2026-09-16 17:56:50.9582+07	lesson-plan-week-7
a1111111-1111-4111-8111-777777777704	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 7 [E]: กิจกรรม Exit Ticket สรุปคำศัพท์การปรุง/รสชาติ 6 คำ และ Quiz สัปดาห์ที่ 7	ให้ตัวแทนแต่ละกลุ่มนำเสนออธิบายอาหารสดหน้าชั้นเรียนโดยไม่ใช้โพย, ผู้เรียนทุกคนทำ Quiz ออนไลน์ด้านคำศัพท์ Food Description และเขียน Exit Ticket สรุปคำศัพท์วิธีปรุง 3 คำ และคำอธิบายรสชาติ 3 คำพร้อมคำแปลส่งก่อนจบคลาส	Exhibit	\N	\N	2026-11-04 17:56:50.9582+07	20	2026-09-16 17:56:50.9582+07	2026-09-16 17:56:50.9582+07	lesson-plan-week-7
a1111111-1111-4111-8111-888888888801	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 8 [F]: ใบงาน Worksheet & AI Scan จัดหมวดหมู่ไวน์และรสชาติ The Beverage Sommelier	ให้นักเรียนสแกนดูโมเดล 3D ขวดเครื่องดื่ม/แก้วไวน์ และใช้ AI Scan สแกนฉลากเครื่องดื่มเพื่อระบุรสชาติและประวัติย่อ พร้อมทำใบงานแยกหมวดหมู่ Wine Categories และ Taste Profiles	Familiarize	\N	\N	2026-11-11 18:03:34.302724+07	20	2026-09-16 18:03:34.302724+07	2026-09-16 18:03:34.302724+07	lesson-plan-week-8
a1111111-1111-4111-8111-888888888802	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 8 [I]: ฝึกสนทนาแนะนำเครื่องดื่มและตอบข้อซักถามกับ AI Support	ให้นักเรียนฝึกโต้ตอบด้วยเสียงจริงกับ AI ในโหมดลูกค้าจุกจิกที่สอบถามเรื่องไวน์และรสชาติเครื่องดื่ม เช่น "What kind of wine goes well with this spicy pasta?" เพื่อรับ Feedback ด้านการออกเสียงและการจัดลำดับคำพูด	Interact	\N	\N	2026-11-11 18:03:34.302724+07	20	2026-09-16 18:03:34.302724+07	2026-09-16 18:03:34.302724+07	lesson-plan-week-8
a1111111-1111-4111-8111-888888888803	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 8 [N]: ภารกิจจำลอง Restaurant Simulation แนะนำเครื่องดื่มจับคู่อาหาร Food Pairing & Upselling	ให้นักเรียนฝึกปฏิบัติการแนะนำเครื่องดื่มและจับคู่ไวน์กับอาหารตามการ์ดคำสั่งภารกิจ (เช่น ลูกค้าสั่งปลาหิมะอบ หรือลูกค้าไม่ดื่มแอลกอฮอล์) พร้อมฝึกท่วงท่าการผายมือชี้เมนูและการใช้น้ำเสียง Upselling อย่างสุภาพ	Navigate	\N	\N	2026-11-11 18:03:34.302724+07	20	2026-09-16 18:03:34.302724+07	2026-09-16 18:03:34.302724+07	lesson-plan-week-8
a1111111-1111-4111-8111-888888888804	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 8 [E]: กิจกรรม Exit Ticket ออกแบบคู่หูอาหารและเครื่องดื่ม 1 คู่ และ Quiz สัปดาห์ที่ 8	ให้ตัวแทนแสดงบทบาทสมมติการแนะนำเครื่องดื่มจับคู่หน้าโต๊ะอาหารจำลอง, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Beverage Recommendation & Food Pairing และเขียน Exit Ticket ออกแบบคู่หูอาหาร-เครื่องดื่ม 1 คู่พร้อมประโยคแนะนำส่งก่อนจบคลาส	Exhibit	\N	\N	2026-11-11 18:03:34.302724+07	20	2026-09-16 18:03:34.302724+07	2026-09-16 18:03:34.302724+07	lesson-plan-week-8
a1111111-1111-4111-8111-999999999901	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 9 [F]: ใบงาน Worksheet โครงสร้างรูปประโยครับออเดอร์ The Perfect Order Taking Sheet	ให้นักเรียนศึกษาโครงสร้างประโยคมาตรฐาน Taking Orders Pattern และทำใบงานจำแนกประโยค 4 หมวด (เปิดรับออเดอร์, สอบถามรายละเอียด/เครื่องเคียง, แนะนำเพิ่มเติม, ปิดท้าย/ขอบคุณ)	Familiarize	\N	\N	2026-11-18 18:05:59.816356+07	20	2026-09-16 18:05:59.816356+07	2026-09-16 18:05:59.816356+07	lesson-plan-week-9
a1111111-1111-4111-8111-999999999903	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 9 [N]: สถานการณ์จำลอง Restaurant Simulation ภารกิจรับออเดอร์ด้วยสมุด Order Pad	ให้นักเรียนแบ่งกลุ่มปฏิบัติหน้าที่พนักงานบริการรับออเดอร์ตามการ์ดบทบาทสมมติ (เช่น ลูกค้ามังสวิรัติขอเปลี่ยนเครื่องเคียง) ฝึกจดบันทึกลงใน Order Pad ด้วยรหัสย่อสากลและทวนรายการอาหารอย่างถูกต้อง	Navigate	\N	\N	2026-11-18 18:05:59.816356+07	20	2026-09-16 18:05:59.816356+07	2026-09-16 18:05:59.816356+07	lesson-plan-week-9
a1111111-1111-4111-8111-999999999904	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 9 [E]: กิจกรรม Exit Ticket สรุปประโยครับออเดอร์ 3 ข้อ และ Quiz สัปดาห์ที่ 9	ให้ตัวแทนสาธิตการรับออเดอร์สดหน้าชั้นเรียนตามเงื่อนไขท้าทาย, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Taking Orders Pattern และเขียน Exit Ticket ประโยคคำถามรับออเดอร์ที่มั่นใจ 3 ประโยคส่งก่อนจบคลาส	Exhibit	\N	\N	2026-11-18 18:05:59.816356+07	20	2026-09-16 18:05:59.816356+07	2026-09-16 18:05:59.816356+07	lesson-plan-week-9
a1111111-1111-4111-8111-101010101001	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 10 [F]: ใบงาน Worksheet โครงสร้าง Order Taking Simulation (Restaurant & Room Service)	ให้นักเรียนศึกษาผังขั้นตอน Flowchart การรับออเดอร์ทั้ง 2 รูปแบบผ่าน QR Code Learning Access ทำใบงานจำแนกสถานการณ์ และเติมคำในโครงสร้างประโยคการรับสาย Room Service และการเชียร์ขาย (Upselling) ให้ถูกต้องสมบูรณ์	Familiarize	\N	\N	2026-11-25 18:09:48.655052+07	20	2026-09-16 18:09:48.655052+07	2026-09-16 18:09:48.655052+07	lesson-plan-week-10
a1111111-1111-4111-8111-101010101002	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 10 [I]: ฝึกสนทนารับออเดอร์ 2 โหมด (Restaurant & Room Service) ผ่าน Gemini Live	ให้นักเรียนใช้ Gemini Live ผ่าน web app FINE Model สวมบทบาทรับออเดอร์หน้าโต๊ะ (Restaurant Mode) และรับสายสั่งอาหารเช้าแบบ Room Service Mode โดยฝึกทักษะการฟังเสียงโดยไม่มองจอ พร้อมบันทึกผลลงใน AI Learning Record	Interact	\N	\N	2026-11-25 18:09:48.655052+07	20	2026-09-16 18:09:48.655052+07	2026-09-16 18:09:48.655052+07	lesson-plan-week-10
a1111111-1111-4111-8111-101010101003	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 10 [N]: สถานการณ์จำลอง SBL สถานี Restaurant และ Room Service Station	ให้นักเรียนสลับบทบาทเข้าปฏิบัติงานจริงใน 2 สถานี: สถานีที่ 1 รับออเดอร์หน้าโต๊ะพร้อมจัดท่ายืนและเชียร์ขาย และสถานีที่ 2 รับสายโทรศัพท์ภายใน 3 ครั้ง จดชื่อ/เลขห้องลงใบสั่งซื้อด่วน พร้อมแก้ปัญหาเมื่อลูกค้าขอเปลี่ยนส่วนผสมกะทันหัน	Navigate	\N	\N	2026-11-25 18:09:48.655052+07	20	2026-09-16 18:09:48.655052+07	2026-09-16 18:09:48.655052+07	lesson-plan-week-10
a1111111-1111-4111-8111-101010101004	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 10 [E]: กิจกรรม Exit Ticket สะท้อนคิดและแบบทดสอบออนไลน์ Order Taking Simulation	สุ่มตัวแทนสาธิตการรับออเดอร์สดทั้ง 2 โซนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Order Taking Simulation และส่ง Exit Ticket สะท้อนจุดที่ต้องปรับปรุงในการฟังพร้อม 1 ประโยค Upselling ที่ใช้สำเร็จ	Exhibit	\N	\N	2026-11-25 18:09:48.655052+07	20	2026-09-16 18:09:48.655052+07	2026-09-16 18:09:48.655052+07	lesson-plan-week-10
a1111111-1111-4111-8111-121212121201	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 12 [F]: ใบงาน Worksheet จำแนกคำขอพิเศษ (Food vs Service) และ AI Scan เมนูอาหาร	ให้นักเรียนสแกน QR Code เพื่อเปิด Flowchart Interactive ขั้นตอน Special Request Protocol, ใช้ฟังก์ชัน AI Scan สแกนส่วนผสมบนเมนูเพื่อค้นหาคำศัพท์กลุ่มโภชนาการ (Dietary Requirements) และทำใบงานคัดแยกประเภทคำขอพิเศษ พร้อมเติมคำสำนวนบริการ	Familiarize	\N	\N	2026-12-09 18:16:25.209219+07	20	2026-09-16 18:16:25.209219+07	2026-09-16 18:16:25.209219+07	lesson-plan-week-12
a1111111-1111-4111-8111-121212121202	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 12 [I]: ฝึกสนทนาจัดการคำขอพิเศษและการปฏิเสธอย่างสุภาพผ่าน Gemini Live	ให้นักเรียนใช้ Gemini Live ผ่าน web app FINE Model ใน 2 ภารกิจ: 1) Dietary Request Mode แนะนำเมนูสำหรับลูกค้า Vegan เคร่งครัด 2) Service Constraint Challenge ฝึกปฏิเสธคำขอที่ทำไม่ได้อย่างสุภาพพร้อมเสนอทางเลือกใหม่ (Polite Refusal & Alternative Suggestion)	Interact	\N	\N	2026-12-09 18:16:25.209219+07	20	2026-09-16 18:16:25.209219+07	2026-09-16 18:16:25.209219+07	lesson-plan-week-12
a1111111-1111-4111-8111-121212121203	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 12 [N]: สถานการณ์จำลอง Restaurant Simulation รับมือเงื่อนไขคำขอพิเศษท้าทาย	แบ่งกลุ่มสวมบทบาทรับมือคำขอพิเศษจากการ์ดสถานการณ์ (เช่น สเต็กไม่ใส่น้ำมัน/เนยเลย หรือลูกค้ารถเข็นขอย้ายโต๊ะด่วน) บันทึกลงใบออเดอร์พร้อมทำสัญลักษณ์ประสานงานครัวและทีมบริการอย่างถูกต้อง	Navigate	\N	\N	2026-12-09 18:16:25.209219+07	20	2026-09-16 18:16:25.209219+07	2026-09-16 18:16:25.209219+07	lesson-plan-week-12
a1111111-1111-4111-8111-121212121204	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 12 [E]: สาธิตการเจรจาคำขอพิเศษสด, ทำ Quiz ออนไลน์ และ Exit Ticket สำนวนแก้ไขสถานการณ์	สุ่มตัวแทนสาธิตการรับมือคำขอพิเศษสดหน้าชั้นเรียนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Handling Special Requests และพิมพ์ส่ง Exit Ticket ประโยคภาษาอังกฤษในการแก้ไขสถานการณ์เมื่อไม่สามารถปรับเปลี่ยนเมนูได้ 1 ประโยค	Exhibit	\N	\N	2026-12-09 18:16:25.209219+07	20	2026-09-16 18:16:25.209219+07	2026-09-16 18:16:25.209219+07	lesson-plan-week-12
a1111111-1111-4111-8111-131313131301	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 13 [F]: ใบงานคำศัพท์ Food Allergens และ AI Scan ตรวจจับสารก่อภูมิแพ้ในเมนู	สแกน QR Code ศึกษา Interactive Guide สัญลักษณ์สารก่อภูมิแพ้สากล (International Allergen Codes), ใช้ AI Scan ตรวจจับส่วนผสมที่ซ่อนเร้นในเมนูอาหารจำลอง และทำใบงานจับคู่คำศัพท์สารก่อภูมิแพ้พร้อมเติมโครงสร้างประโยคซักถาม	Familiarize	\N	\N	2026-12-16 18:22:15.085561+07	20	2026-09-16 18:22:15.085561+07	2026-09-16 18:22:15.085561+07	lesson-plan-week-13
a1111111-1111-4111-8111-131313131302	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 13 [I]: ฝึกสนทนาคัดกรองอาการแพ้และระงับออเดอร์ฉุกเฉินผ่าน Gemini Live	ฝึกซ้อมผ่าน Gemini Live ใน 2 ภารกิจวิกฤต: 1) Allergy Screening Mode ซักถามและแนะนำเมนูปลอดภัยแก่ลูกค้าแพ้กลูเตนรุนแรง (Celiac Disease) 2) Emergency Substitution Challenge ระงับออเดอร์และเสนอเมนูทดแทนทันทีเมื่อลูกค้าเพิ่งแจ้งอาการแพ้ถั่ว พร้อมบันทึก AI Learning Record	Interact	\N	\N	2026-12-16 18:22:15.085561+07	20	2026-09-16 18:22:15.085561+07	2026-09-16 18:22:15.085561+07	lesson-plan-week-13
a1111111-1111-4111-8111-131313131303	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 13 [N]: สถานการณ์จำลอง Allergy Alert Room จดเตือนสีแดงและประสานงานเปลี่ยนเมนู	แบ่งกลุ่มเข้าจำลองสถานการณ์ห้องอาหาร Allergy Alert Room รับออเดอร์ลูกค้าที่มีอาการแพ้ เขียนคำเตือนสีแดงเด่นชัดบน Captain Order Pad และประสานงานส่งต่อเชฟในครัว พร้อมเจรจาเปลี่ยนเมนูอย่างสุภาพเมื่อครัวไม่สามารถแยกสารก่อภูมิแพ้ได้	Navigate	\N	\N	2026-12-16 18:22:15.085561+07	20	2026-09-16 18:22:15.085561+07	2026-09-16 18:22:15.085561+07	lesson-plan-week-13
a1111111-1111-4111-8111-131313131304	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 13 [E]: สาธิตการรับมือลูกค้าแพ้อาหารสด, ทำ Quiz ออนไลน์ และส่ง Exit Ticket	สุ่มตัวแทนสาธิตการรับออเดอร์แขกแพ้อาหารและการเปลี่ยนเมนูสดหน้าชั้นเรียนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Food Allergens and Professional Service Communication และเขียน Exit Ticket ระบุ 2 ข้อห้ามสำคัญพร้อม 1 ประโยคเสนอเปลี่ยนเมนู	Exhibit	\N	\N	2026-12-16 18:22:15.085561+07	20	2026-09-16 18:22:15.085561+07	2026-09-16 18:22:15.085561+07	lesson-plan-week-13
a1111111-1111-4111-8111-141414141401	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 14 [F]: ใบงานคำศัพท์เมนูหมด และ AI Scan วิเคราะห์จุดเด่นเพื่อจับคู่เมนูทดแทน	สแกน QR Code ศึกษา Flowchart Interactive การจับคู่เมนูทดแทน (Menu Substitution Flow), ใช้ AI Scan สแกนเล่มเมนูวิเคราะห์จุดเด่น รสชาติ และระดับราคาเพื่อหาเมนูทดแทนที่เหมาะสม และทำแบบฝึกหัดคำศัพท์และเติมโครงสร้างประโยคขออภัย/เสนอทางเลือก	Familiarize	\N	\N	2026-12-23 18:37:34.798307+07	20	2026-09-16 18:37:34.798307+07	2026-09-16 18:37:34.798307+07	lesson-plan-week-14
a1111111-1111-4111-8111-141414141402	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 14 [I]: ฝึกสนทนาขออภัยและรับมือลูกค้ายาก (Difficult Guest) ผ่าน Gemini Live	ใช้ Gemini Live ฝึกซ้อม 2 ภารกิจ: 1) Apology & Alternative Pattern เจรจาแจ้งเมนูซิกเนเจอร์หมดและโน้มน้าวให้ลูกค้าเลือกเมนูอื่น 2) Difficult Guest Challenge รับมือลูกค้าที่หงุดหงิดและปฏิเสธตัวเลือกแรกด้วยทักษะเสนอสิทธิประโยชน์ พร้อมบันทึก AI Learning Record	Interact	\N	\N	2026-12-23 18:37:34.798307+07	20	2026-09-16 18:37:34.798307+07	2026-09-16 18:37:34.798307+07	lesson-plan-week-14
a1111111-1111-4111-8111-141414141403	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 14 [N]: สถานการณ์จำลองแก้ไขปัญหาเมนูหมดตามการ์ด Conflict Situation Cards	แบ่งกลุ่มเข้าจำลองสถานการณ์ห้องอาหาร รับมือปัญหาความขัดแย้งเมื่อเมนูที่ลูกค้าต้องการหมด (เช่น ไวน์ฉลองวันครบรอบหมด) ขออภัย แนะนำเมนูรสชาติใกล้เคียง พร้อมนำเสนอบริการเสริมชดเชยความรู้สึก และแก้ไขใบออเดอร์พร้อมอัปเดตระบบ	Navigate	\N	\N	2026-12-23 18:37:34.798307+07	20	2026-09-16 18:37:34.798307+07	2026-09-16 18:37:34.798307+07	lesson-plan-week-14
a1111111-1111-4111-8111-141414141404	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 14 [E]: สาธิตบทบาทสมมติแก้ปัญหาเมนูหมดสด, Quiz ออนไลน์ และส่ง Exit Ticket	สุ่มตัวแทนสาธิตการแก้ปัญหาเมนูหมดสดหน้าชั้นเรียนเน้น Fluency & Hospitality Tone ตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Dealing with Unavailable Items และส่ง Exit Ticket ประโยคแนะนำเมนูทดแทนที่ประทับใจที่สุด 1 ประโยค	Exhibit	\N	\N	2026-12-23 18:37:34.798307+07	20	2026-09-16 18:37:34.798307+07	2026-09-16 18:37:34.798307+07	lesson-plan-week-14
a1111111-1111-4111-8111-151515151501	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 15 [F]: ใบงานคำศัพท์ข้อร้องเรียน, ขั้นตอน LAST Model และ AI Scan วิเคราะห์อารมณ์	ใช้ฟังก์ชัน AI Scan สแกนภาพกรณีศึกษาในใบงานเพื่อวิเคราะห์ระดับอารมณ์และประเภทข้อร้องเรียน (อาหาร/บริการ/สิ่งแวดล้อม), ทำแบบฝึกหัดคำศัพท์ จับคู่ขั้นตอน LAST Model (Listen, Apologize, Solve, Thank) และเติมโครงสร้างประโยคขออภัย	Familiarize	\N	\N	2026-12-30 18:40:07.990024+07	20	2026-09-16 18:40:07.990024+07	2026-09-16 18:40:07.990024+07	lesson-plan-week-15
a1111111-1111-4111-8111-151515151502	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 15 [I]: ฝึกสนทนารับมือลูกค้าโกรธ (พบสิ่งแปลกปลอมในจาน) ผ่าน Gemini Live	ฝึกซ้อมผ่าน Gemini Live โต้ตอบกับ AI ในบทบาทลูกค้ากำลังโกรธเนื่องจากพบสิ่งแปลกปลอมในจานอาหาร ใช้สำนวนขออภัยอย่างเป็นทางการและเสนอเปลี่ยนจานทันที พร้อมรับประเมิน Tone of Voice บันทึกลง Gemini Live Session Log	Interact	\N	\N	2026-12-30 18:40:07.990024+07	20	2026-09-16 18:40:07.990024+07	2026-09-16 18:40:07.990024+07	lesson-plan-week-15
a1111111-1111-4111-8111-151515151503	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 15 [N]: สถานการณ์จำลองห้องอาหาร Crisis Control Room รับมือข้อร้องเรียนรุนแรง	แบ่งกลุ่มเข้าจำลองสถานการณ์ Crisis Control Room รับมือลูกค้าที่เข้ามาตำหนิบริการอย่างรุนแรงหน้างาน ประยุกต์ใช้หลักการฟังอย่างใส่ใจ (Active Listening) แสดงภาษากายสุภาพ และระงับอารมณ์ลูกค้าพร้อมรับมือเงื่อนไขเปลี่ยนกลางคัน	Navigate	\N	\N	2026-12-30 18:40:07.990024+07	20	2026-09-16 18:40:07.990024+07	2026-09-16 18:40:07.990024+07	lesson-plan-week-15
a1111111-1111-4111-8111-151515151504	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 15 [E]: สาธิตการรับมือข้อร้องเรียนสดหน้าชั้นเรียน, Quiz ออนไลน์ และส่ง Exit Ticket	สุ่มตัวแทนสาธิตการรับมือข้อร้องเรียนภาษาอังกฤษสดหน้าชั้นเรียนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Handling Customer Complaints และส่ง Exit Ticket เขียนประโยคภาษาอังกฤษ 3 ประโยคในการจัดการความโกรธของลูกค้า	Exhibit	\N	\N	2026-12-30 18:40:07.990024+07	20	2026-09-16 18:40:07.990024+07	2026-09-16 18:40:07.990024+07	lesson-plan-week-15
a1111111-1111-4111-8111-161616161601	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 16 [F]: ใบงานคำศัพท์ Service Recovery, วิเคราะห์ Service Recovery Matrix ด้วย AI Scan	สแกน QR Code ศึกษาตารางเกณฑ์ตัดสินใจ Service Recovery Matrix, ใช้ AI Scan สแกน Recovery Scenario Cards เพื่อศึกษาโครงสร้างประโยคยื่นข้อเสนอและขอยกเว้นค่าบริการ และทำแบบฝึกหัดคำศัพท์เกี่ยวกับการชดเชยพร้อมเติมประโยคเสนอวิธีแก้ไขและติดตามผล	Familiarize	\N	\N	2027-01-06 18:43:09.44907+07	20	2026-09-16 18:43:09.44907+07	2026-09-16 18:43:09.44907+07	lesson-plan-week-16
a1111111-1111-4111-8111-161616161602	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 16 [I]: ฝึกเจรจายื่นข้อเสนอชดเชยและติดตามความพึงพอใจผ่าน Gemini Live	ฝึกฝนผ่าน Gemini Live ใน 2 ภารกิจ: 1) Negotiation Challenge เจรจาโน้มน้าวลูกค้ายากที่ปฏิเสธคำขอโทษและจะโพสต์โซเชียลด้วยข้อเสนอเปลี่ยนจานและส่วนลด 2) Satisfaction Check ตรวจสอบความพึงพอใจด้วยน้ำเสียงที่กระตือรือร้นจริงใจ พร้อมบันทึกลงใน AI Learning Record	Interact	\N	\N	2027-01-06 18:43:09.44907+07	20	2026-09-16 18:43:09.44907+07	2026-09-16 18:43:09.44907+07	lesson-plan-week-16
a1111111-1111-4111-8111-161616161603	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 16 [N]: กิจกรรม SBL The Ultimate Service Recovery Challenge และบันทึก Recovery Log	เข้าร่วมสถานการณ์จำลองวิกฤตหน้างาน (เช่น ออเดอร์ตกหล่นรอนาน 30 นาที หรือทำเครื่องดื่มหกรดเสื้อผ้า) ตัดสินใจยื่นข้อเสนอชดเชยตามขอบเขตอำนาจหน้าที่อย่างรวดเร็ว และบันทึกรายงานลงในแบบฟอร์ม Guest Complaint & Recovery Log	Navigate	\N	\N	2027-01-06 18:43:09.44907+07	20	2026-09-16 18:43:09.44907+07	2026-09-16 18:43:09.44907+07	lesson-plan-week-16
a1111111-1111-4111-8111-161616161604	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 16 [E]: ทดสอบสถานการณ์จำลองสด Unseen Scenario, Quiz และ Exit Ticket สิ่งสมนาคุณ	สุ่มจับคู่รับสถานการณ์จำลองสดหน้าชั้นเรียน (Unseen Scenario) เพื่อทดสอบไหวพริบและการใช้ภาษาอังกฤษตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Service Recovery Strategies & Expressions และส่ง Exit Ticket ระบุ 1 วิธีชดเชยที่ดีที่สุดพร้อม 1 ประโยคเสนอสิ่งสมนาคุณ	Exhibit	\N	\N	2027-01-06 18:43:09.44907+07	20	2026-09-16 18:43:09.44907+07	2026-09-16 18:43:09.44907+07	lesson-plan-week-16
a1111111-1111-4111-8111-171717171701	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 17 [F]: ใบงาน Core Service Cycle และ AI Scan วิเคราะห์แผนผังบริการวิชาชีพ	ศึกษาใบความรู้ Core Service Cycle Map และขั้นตอนบริการพิเศษ (Room Service & Gueridon Service), ใช้ฟังก์ชัน AI Scan สแกนสัญลักษณ์เพื่อวิเคราะห์ลำดับก่อน-หลังในการเสิร์ฟ และทำแบบฝึกหัดเติมประโยคการแจ้งยอดบิลและการปิดการบริการ	Familiarize	\N	\N	2027-01-13 18:45:31.453896+07	20	2026-09-16 18:45:31.453896+07	2026-09-16 18:45:31.453896+07	lesson-plan-week-17
a1111111-1111-4111-8111-171717171702	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 17 [I]: ฝึกซ้อมบทสนทนาเฉพาะหน้า (แขกรีบเช็คบิล/ถามยอดบิล) ผ่าน Gemini Live	จับคู่ฝึกปฏิบัติผ่าน Gemini Live ในสถานีย่อย สุ่มบทบาทจำลองเป็นแขกประเภทต่างๆ เช่น แขกที่รีบเช็คบิลเพื่อไปขึ้นเครื่องบิน หรือแขกที่ถามรายละเอียดการคิดเงินในบิล ฝึกความคล่องแคล่วและระดับภาษาที่เป็นมืออาชีพ พร้อมบันทึก AI Learning Record	Interact	\N	\N	2027-01-13 18:45:31.453896+07	20	2026-09-16 18:45:31.453896+07	2026-09-16 18:45:31.453896+07	lesson-plan-week-17
a1111111-1111-4111-8111-171717171703	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 17 [N]: กิจกรรม Restaurant Simulation Challenge วงจรบริการเต็มรูปแบบครบวงจร	รวมกลุ่มปฏิบัติหน้าที่ทีมบริการ: Greeter, Server, Gueridon Attendant และ Cashier ปฏิบัติงานจริงเต็มรูปแบบในห้องอาหารจำลอง ตั้งแต่ต้อนรับ รับออเดอร์ เสิร์ฟตามเข็มนาฬิกา บริการรถเข็น Gueridon และคิดเงินเป็นภาษาอังกฤษ พร้อมแก้ไขเหตุขัดข้องหน้างาน	Navigate	\N	\N	2027-01-13 18:45:31.453896+07	20	2026-09-16 18:45:31.453896+07	2026-09-16 18:45:31.453896+07	lesson-plan-week-17
a1111111-1111-4111-8111-171717171704	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 17 [E]: สาธิตวงจรบริการเต็มรูปแบบ, Service Sequence Quiz และส่ง Exit Ticket	ตัวแทนกลุ่มสาธิตวงจรบริการเต็มรูปแบบต่อหน้าชั้นเรียนตามเกณฑ์ Rubrics มาตรฐานสากล, ผู้เรียนทุกคนทำ Service Sequence Quiz ออนไลน์ผ่าน web app FINE Model และพิมพ์ส่ง Exit Ticket ข้อควรระวังในการคิดเงินและปิดการบริการ	Exhibit	\N	\N	2027-01-13 18:45:31.453896+07	20	2026-09-16 18:45:31.453896+07	2026-09-16 18:45:31.453896+07	lesson-plan-week-17
a1111111-1111-4111-8111-181818181801	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 18 [F]: ใบงานจัดทำโครงสร้าง e-Portfolio และรวบรวม Learning Record ผ่าน AI Scan	ระบุองค์ประกอบสำคัญ 4 ประการของ e-Portfolio, ใช้ AI Scan สแกนประมวลผลสัมฤทธิ์จากบันทึกการเรียนรู้ตลอด 17 สัปดาห์ และเขียนโครงร่างการสะท้อนคิดรายบุคคลในหัวข้อ My F&B Journey เป็นภาษาอังกฤษ	Familiarize	\N	\N	2027-01-20 18:48:04.578191+07	20	2026-09-16 18:48:04.578191+07	2026-09-16 18:48:04.578191+07	lesson-plan-week-18
a1111111-1111-4111-8111-181818181802	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 18 [I]: สอบสัมภาษณ์วิชาชีพจำลอง Viva Voce กับ AI ผู้ประเมินภายนอกผ่าน Gemini Live	เข้าสู่การสอบสัมภาษณ์วิชาชีพจำลอง (Viva Voce) กับ AI ในบทบาท External Assessor ผ่าน Gemini Live ตอบคำถามสถานการณ์จริงและกระบวนการบริการเป็นภาษาอังกฤษแบบเรียลไทม์ พร้อมรับการประเมินบันทึกลงในแฟ้มผลงาน	Interact	\N	\N	2027-01-20 18:48:04.578191+07	20	2026-09-16 18:48:04.578191+07	2026-09-16 18:48:04.578191+07	lesson-plan-week-18
a1111111-1111-4111-8111-181818181803	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 18 [N]: สอบภาคปฏิบัติปลายภาค Final Professional Performance Assessment	เข้ารับการประเมินสมรรถนะภาคปฏิบัติปลายภาคในพื้นที่จำลอง Restaurant Simulation รับมือโจทย์สถานการณ์จำลองระดับพลิกแพลงขั้นสูงสุด บูรณาการทุกสมรรถนะตามเกณฑ์ Rubrics มาตรฐานคุณวุฒิวิชาชีพสากล	Navigate	\N	\N	2027-01-20 18:48:04.578191+07	20	2026-09-16 18:48:04.578191+07	2026-09-16 18:48:04.578191+07	lesson-plan-week-18
a1111111-1111-4111-8111-181818181804	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000020	สัปดาห์ที่ 18 [E]: นิทรรศการแฟ้มผลงาน Gallery Walk, ประเมินเพื่อน และ Exit Ticket ปิดรายวิชา	จัดแสดงแฟ้มผลงาน e-Portfolio ในรูปแบบ Gallery Walk, ทำการประเมินร่วมกันระหว่างเพื่อนร่วมชั้น (Peer-Assessment) และพิมพ์ส่ง Exit Ticket ชิ้นสุดท้ายระบุเป้าหมายในอนาคตเพื่อปิดการเรียนรู้อย่างสมบูรณ์	Exhibit	\N	\N	2027-01-20 18:48:04.578191+07	20	2026-09-16 18:48:04.578191+07	2026-09-16 18:48:04.578191+07	lesson-plan-week-18
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.audit_logs (id, actor_id, action, entity_type, entity_id, details_json, created_at) FROM stdin;
ce1a9a58-114c-490c-8200-3b8c7fe44e51	00000000-0000-0000-0000-000000000001	create_user	profile	34d6dd6f-7403-4bab-94e3-427666851917	{"role": "student", "email": "avatar-test-b63f4723fd@local.test", "status": "active"}	2026-09-14 17:47:21.892653+07
44ebe8b3-203f-4791-81d0-c2a4fbd2ea90	\N	update_avatar	profile	34d6dd6f-7403-4bab-94e3-427666851917	{"size": 68, "mimeType": "image/png"}	2026-09-14 17:47:22.329538+07
966fdf22-bd4a-4dfb-9c39-bedb86cbf2a4	\N	update_avatar	profile	34d6dd6f-7403-4bab-94e3-427666851917	{"size": 68, "mimeType": "image/png"}	2026-09-14 17:47:22.34608+07
9264108c-7a11-4685-a2d4-9650131cf89d	00000000-0000-0000-0000-000000000001	delete_user	profile	34d6dd6f-7403-4bab-94e3-427666851917	{}	2026-09-14 17:47:22.371848+07
ec40f410-27c2-4198-8846-beb9bc02e907	00000000-0000-0000-0000-000000000001	create_user	profile	deaf8622-e69d-4b4f-8238-f60618a3413e	{"role": "student", "email": "certificate-test-12b6fbfaf1@local.test", "status": "active"}	2026-09-14 17:47:27.036815+07
323de62a-1413-4ec1-b23e-b65a718da5ca	00000000-0000-0000-0000-000000000001	issue_certificate	certificate	de6a964e-b679-47e9-85c5-310915611e9f	{"overallScore": 84, "certificateCode": "FINE-CEDE441081AACFA6", "previousCertificateCode": null}	2026-09-14 17:47:27.051585+07
7285f3ab-8973-47f3-b6e1-f64d45747870	00000000-0000-0000-0000-000000000001	reissue_certificate	certificate	de6a964e-b679-47e9-85c5-310915611e9f	{"overallScore": 84, "certificateCode": "FINE-E408D9D9BEB175A1", "previousCertificateCode": "FINE-CEDE441081AACFA6"}	2026-09-14 17:47:27.067878+07
d62a3c33-ec1d-40e9-8a2d-4f2b7f4c6d2d	00000000-0000-0000-0000-000000000001	revoke_certificate	certificate	de6a964e-b679-47e9-85c5-310915611e9f	{"action": "revoke"}	2026-09-14 17:47:27.074422+07
5fc6be8b-c9d8-4058-a302-ea4a5093eb6c	00000000-0000-0000-0000-000000000001	restore_certificate	certificate	de6a964e-b679-47e9-85c5-310915611e9f	{"action": "restore"}	2026-09-14 17:47:27.084571+07
5b69e1b1-07d0-474b-aff2-c169e8aec45b	00000000-0000-0000-0000-000000000001	delete_user	profile	deaf8622-e69d-4b4f-8238-f60618a3413e	{}	2026-09-14 17:47:27.111554+07
86739a6c-6349-4e26-a7e1-6a7fa90ed262	00000000-0000-0000-0000-000000000001	create_user	profile	9af90f51-f188-4534-8b78-0b62b30e365d	{"role": "teacher", "email": "upload-teacher-6f2a7807fa@local.test", "status": "active"}	2026-09-14 17:47:31.529273+07
44b41215-a95d-4184-bace-263df162c723	00000000-0000-0000-0000-000000000001	create_user	profile	2d9094c4-b9e6-4caa-88ce-dd63571bbf90	{"role": "student", "email": "upload-student-6f2a7807fa@local.test", "status": "active"}	2026-09-14 17:47:31.957755+07
12be280b-6280-417e-99b1-333cb3920d50	00000000-0000-0000-0000-000000000001	delete_user	profile	9af90f51-f188-4534-8b78-0b62b30e365d	{}	2026-09-14 17:47:31.974775+07
2262cafb-8ad1-4c4d-acaf-261bbd4b586d	00000000-0000-0000-0000-000000000001	delete_user	profile	2d9094c4-b9e6-4caa-88ce-dd63571bbf90	{}	2026-09-14 17:47:31.984025+07
d5f35ddd-ab38-47eb-b9ae-75ca84b07ad2	00000000-0000-0000-0000-000000000001	create_user	profile	0af1ac3b-eb10-436d-9da7-7f76bf48afe2	{"role": "teacher", "email": "upload-teacher-44b2772167@local.test", "status": "active"}	2026-09-14 17:48:36.421939+07
6236ede8-b782-491c-a173-843f4d2b8c83	00000000-0000-0000-0000-000000000001	create_user	profile	253f5328-cb1a-4413-b898-e6f16bf570eb	{"role": "student", "email": "upload-student-44b2772167@local.test", "status": "active"}	2026-09-14 17:48:36.852428+07
2c82f844-8b8c-43ca-858a-aa0549d2444e	00000000-0000-0000-0000-000000000001	delete_user	profile	0af1ac3b-eb10-436d-9da7-7f76bf48afe2	{}	2026-09-14 17:48:37.783259+07
5edaf35e-53ca-47b0-9a62-176fed05ad17	\N	upload_assignment_file	stored_file	e4381b52-028d-4ecb-b50c-fe0d0e530f49	{"size": 46, "mimeType": "text/plain", "assignmentId": "79d162e4-382b-44b7-918c-1f4bc5f20242"}	2026-09-14 17:48:37.30516+07
53b9aced-3a57-4ad3-87b9-4f168ae92002	00000000-0000-0000-0000-000000000001	delete_user	profile	253f5328-cb1a-4413-b898-e6f16bf570eb	{}	2026-09-14 17:48:37.79126+07
d9b3f22e-a243-4d10-a7fe-c156150a42aa	00000000-0000-0000-0000-000000000001	create_user	profile	3ee2ad72-7942-4374-9d13-ae801096bf97	{"role": "student", "email": "mailpit-test-9bfd836f92@local.test", "status": "active"}	2026-09-14 17:49:04.858269+07
0106f669-8e13-47c3-b5d0-247f9361e883	00000000-0000-0000-0000-000000000001	pdpa_consent_agreed	profile	00000000-0000-0000-0000-000000000001	{"ip": "10.238.178.101", "version": "1.0", "timestamp": "2026-09-16T05:50:06.495Z", "userAgent": "node"}	2026-09-16 12:50:06.496028+07
a2bb2818-461e-46b2-ac27-a8449c779036	00000000-0000-0000-0000-000000000020	pdpa_consent_agreed	profile	00000000-0000-0000-0000-000000000020	{"ip": "::1", "version": "1.0", "timestamp": "2026-09-16T06:37:31.304Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36"}	2026-09-16 13:37:31.304586+07
a0483e78-6a97-48bc-8498-6201c40420fe	00000000-0000-0000-0000-000000000003	pdpa_consent_agreed	profile	00000000-0000-0000-0000-000000000003	{"ip": "::1", "version": "1.0", "timestamp": "2026-09-16T06:41:28.691Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36"}	2026-09-16 13:41:28.691274+07
52e92ab4-3c8c-4750-8df1-53c42b5a24d5	00000000-0000-0000-0000-000000000001	pdpa_consent_agreed	profile	00000000-0000-0000-0000-000000000001	{"ip": "10.69.185.194", "version": "1.0", "timestamp": "2026-09-16T07:59:08.587Z", "userAgent": "node"}	2026-09-16 14:59:08.587981+07
9905f4d2-7b46-488b-b845-3db0e334d131	00000000-0000-0000-0000-000000000001	pdpa_consent_agreed	profile	00000000-0000-0000-0000-000000000001	{"ip": "10.139.101.81", "version": "1.0", "timestamp": "2026-09-16T09:26:29.896Z", "userAgent": "node"}	2026-09-16 16:26:29.89725+07
\.


--
-- Data for Name: certificate_events; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.certificate_events (id, certificate_id, actor_id, event_type, details_json, created_at) FROM stdin;
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.certificates (id, certificate_code, student_id, certificate_type, issued_name, school_name, overall_score, score_snapshot, issued_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.chat_sessions (id, student_id, session_type, topic, messages_json, started_at, ended_at) FROM stdin;
9b48c8e3-bb5d-4d90-a839-592f3c497814	00000000-0000-0000-0000-000000000003	gemini_chat	General Conversation	[{"role": "user", "text": "สวัสดีครับ ช้อนส้อมสำหรับทานอาหารหลักเรียกว่าอะไร"}, {"role": "model", "text": "สวัสดีครับ ยินดีต้อนรับสู่แพลตฟอร์ม **FINE MODEL** ครับ! \\n\\nสำหรับช้อนส้อมที่ใช้สำหรับทานอาหารจานหลัก (Main Course) ในทางวิชาชีพการบริการอาหารและเครื่องดื่ม จะเรียกว่า:\\n\\n* **ส้อมอาหารหลัก:** **Dinner Fork** (หรือ Table Fork)\\n* **ช้อนอาหารหลัก:** **Dinner Spoon** (หรือ Table Spoon)\\n* **เรียกรวมกันว่า:** **Dinner Cutlery** หรือ **Main Course Flatware** ครับ\\n\\nอุปกรณ์ชุดนี้จะมีขนาดใหญ่ที่สุดในบรรดาช้อนส้อมทั้งหมดบนโต๊ะอาหาร เพื่อให้เหมาะสมกับการรับประทานอาหารจานหลักครับ\\n\\n---\\n\\n💡 **สถานการณ์ตัวอย่างในชีวิตการทำงาน (Real-world Scenario)**\\n\\n**เหตุการณ์:** ลูกค้าทำส้อมสำหรับอาหารหลักตกพื้นขณะรับประทานอาหาร\\n* **พนักงานบริการ (Waiter):** \\"Excuse me, sir. Let me get you a clean **Dinner Fork** right away.\\" *(ขออภัยครับคุณผู้ชาย รอสักครู่นะครับ ผมจะนำส้อมอาหารหลักเล่มใหม่มาเปลี่ยนให้ทันทีครับ)*\\n\\n---\\n\\nหากคุณเรียนรู้เรื่องการจัดโต๊ะอาหาร (Table Setting) แล้วอยากทราบคำศัพท์ของอุปกรณ์ชิ้นไหนเพิ่มเติม สอบถามผมได้เลยนะครับ ยินดีช่วยสนับสนุนการเรียนรู้ครับ! 😊"}]	2026-08-26 18:51:52.474382+07	\N
1f5b8208-8bb3-425c-ab94-5aa110b6f10b	00000000-0000-0000-0000-000000000003	gemini_chat	General Conversation	[{"role": "user", "text": "ช่วยแนะนำคำศัพท์ ประโยคสนทนาภาษาอังกฤษ และการจัดวาง/การบริการของ \\"Herbal Dropper Bottle\\" (ขวดน้ำมันสมุนไพรแบบหลอดหยด) ในฐานะบริกรโรงแรมให้หน่อยครับ"}, {"role": "model", "text": "สวัสดีครับผู้เรียน ยินดีต้อนรับสู่การเรียนรู้บนแพลตฟอร์ม FINE MODEL ครับ! \\n\\nการใช้ **\\"Herbal Dropper Bottle\\"** (ขวดน้ำมันหรือสารสกัดสมุนไพรแบบหลอดหยด) กำลังเป็นที่นิยมมากในโรงแรมหรูและร้านอาหารระดับ Fine Dining ครับ เพราะช่วยเพิ่มมิติทั้งเรื่องกลิ่น (Aroma) รสชาติ (Flavor) และสร้างประสบการณ์แบบ Interactive ให้กับผู้เข้าพัก\\n\\nครูขอสรุปคำศัพท์ การจัดวาง และประโยคสนทนาภาษาอังกฤษสำหรับบริกรมืออาชีพให้ดังนี้ครับ:\\n\\n---\\n\\n### 1. คำศัพท์ภาษาอังกฤษที่จำเป็น (Essential Vocabulary)\\n\\n*   **Herbal Dropper Bottle** (n.): ขวดหลอดหยดสมุนไพร\\n*   **Pipette / Dropper** (n.): หลอดหยด (หลอดแก้วสำหรับดูดของเหลว)\\n*   **Herbal Extract / Infused Oil** (n.): สารสกัดสมุนไพร / น้ำมันหมักสมุนไพร\\n*   **Enhance the flavor / Aroma** (v.): ชูรสชาติ / เสริมกลิ่นหอม\\n*   **A few drops** (n.): 2-3 หยดเล็กน้อย\\n*   **Underliner / Coaster** (n.): จานรองขนาดเล็ก หรือแผ่นรองกันหยด\\n\\n---\\n\\n### 2. การจัดวางบนโต๊ะอาหาร (Table Setting & Placement)\\n\\n*   **ตำแหน่งการวาง:** วางไว้ **ด้านขวามือ** ของจานอาหารหลักหรือแก้วเครื่องดื่ม (เพื่อให้แขกหยิบใช้งานได้สะดวกด้วยมือขวา)\\n*   **ภาชนะรอง:** ต้องวางขวดหยดบน **Underliner (จานรองเล็ก)** หรือ **Coaster** เสมอ เพื่อป้องกันไม่ให้น้ำมันหรือของเหลวหยดเลอะผ้าปูโต๊ะ\\n*   **การหันฉลาก:** หันฉลากชื่อสมุนไพรเข้าหาตัวแขกเสมอ เพื่อความสวยงามและชัดเจน\\n\\n---\\n\\n### 3. ขั้นตอนและเทคนิคการบริการ (Service Standard)\\n\\n1.  **การนำเสนอ:** แจ้งแขกถึงวัตถุประสงค์ของสมุนไพรขวดนี้\\n2.  **การให้ตัวเลือก (Interactive Service):** สอบถามแขกว่าต้องการให้เราหยดให้ หรือแขกประสงค์จะทดลองหยดด้วยตนเอง\\n3.  **ข้อควรระวังเรื่องสุขอนามัย (Hygiene):** ขณะหยด **ห้ามให้ปลายหลอดแก้ว (Pipette) สัมผัสกับอาหารหรือเครื่องดื่มเด็ดขาด** ให้ถือสูงเหนืออาหารประมาณ 2-3 นิ้ว\\n\\n---\\n\\n### 4. ประโยคสนทนาและสถานการณ์จำลอง (Real-World Scenario)\\n\\n#### ประโยคที่มักใช้บ่อย (Useful Phrases)\\n*   *\\"To enhance the aroma of your dish/drink, we serve it with...\\"* \\n    (เพื่อเสริมกลิ่นหอมของจานนี้/เครื่องดื่มนี้ เราเสิร์ฟพร้อมกับ...)\\n*   *\\"We recommend adding just 2 to 3 drops.\\"* \\n    (เราแนะนำให้ใส่เพียง 2-3 หยดครับ/ค่ะ)\\n*   *\\"Would you like me to add it for you, or would you prefer to do it yourself?\\"* \\n    (ให้ดิฉัน/กระผมหยดให้เลยไหมคะ/ครับ หรือคุณผู้หญิง/ผู้ชายอยากทดลองหยดเองดีคะ/ครับ)\\n\\n---\\n\\n#### บทสนทนาตัวอย่าง (Role-Play Scenario)\\n\\n**(สถานการณ์: บริกรกำลังเสิร์ฟซุปสมุนไพร/ชาสมุนไพร ให้กับคุณ Smith ในห้องอาหารโรงแรม)**\\n\\n*   **Server (คุณ):** \\"Good evening, Mr. Smith. Here is your Wild Mushroom Soup. On the side, we have a **rosemary-infused herbal dropper bottle**.\\"\\n    *(อรุณสวัสดิ์ยามเย็นครับคุณสมิธ นี่คือซุปเห็ดป่าครับ ด้านข้างเรามีขวดน้ำมันโรสแมรี่แบบหลอดหยดจัดเตรียมไว้ให้ครับ)*\\n\\n*   **Guest:** \\"Oh, interesting! How should I use it?\\"\\n    *(โอ้ น่าสนใจจัง ฉันควรใช้มันยังไงเหรอ?)*\\n\\n*   **Server:** \\"It is designed to **enhance the earthy aroma** of the soup. We recommend adding **just 2 or 3 drops** before tasting. **Would you like me to add it for you, or would you prefer to try it yourself?**\\"\\n    *(ขวดนี้ออกแบบมาเพื่อช่วยชูส่งกลิ่นหอมธรรมชาติต่างๆ ของซุปครับ แนะนำให้หยดเพียง 2-3 หยดก่อนทานครับ ให้ผมหยดให้เลยไหมครับ หรือคุณสมิธอยากลองหยดด้วยตัวเองดีครับ?)*\\n\\n*   **Guest:** \\"I’d love to try it myself, thank you!\\"\\n    *(ฉันอยากลองหยดเอง ขอบใจมากนะ!)*\\n\\n*   **Server:** \\"My pleasure, Mr. Smith. Please enjoy your meal.\\"\\n    *(ยินดีอย่างยิ่งครับคุณสมิธ ขอให้มีความสุขกับอาหารครับ)*\\n\\n---\\n\\n💡 **คำแนะนำเพิ่มเติมจากครู:** การนำเสนอ Herbal Dropper Bottle หัวใจสำคัญคือ **\\"รอยยิ้ม และการอธิบายสั้นๆ ที่น่าตื่นเต้น\\"** ครับ เพราะจะทำให้มื้ออาหารธรรมดากลายเป็นมื้อพิเศษทันที!\\n\\nผู้เรียนลองฝึกพูดประโยคข้างต้นดูนะครับ มีตรงไหนที่อยากปรับใช้กับเมนูเฉพาะของโรงแรมเพิ่มเติม สอบถามครูได้เลยนะครับ! 😊"}]	2026-08-26 18:56:28.385479+07	\N
1e38894b-8e37-4373-af5d-644940d6560b	00000000-0000-0000-0000-000000000003	gemini_chat	Learning Conversation	[{"role": "model", "text": "สวัสดีครับ! ผมคือ AI ผู้ช่วยของ FINE MODEL 🎓\\n\\nผมพร้อมช่วยคุณเรียนรู้การบริการอาหารและเครื่องดื่ม ถามผมได้เลยครับ!\\n\\n💡 ลองถามเกี่ยวกับ:\\n• การทักทายลูกค้าภาษาอังกฤษ\\n• มาตรฐาน Table Setting\\n• การรับออร์เดอร์อาหาร"}, {"role": "user", "text": "ช่วยแนะนำคำศัพท์ ประโยคสนทนาภาษาอังกฤษ และการจัดวาง/การบริการของ \\"Disposable Coffee Cup\\" (แก้วกาแฟพลาสติกแบบใช้แล้วทิ้ง) ในฐานะบริกรโรงแรมให้หน่อยครับ"}, {"role": "model", "text": "สวัสดีครับผู้เรียน ยยินดีต้อนรับสู่ **FINE MODEL** ครับ! สำหรับบทเรียนวันนี้ เราจะมาเรียนรู้เรื่อง **\\"Disposable Coffee Cup\\" (แก้วกาแฟแบบใช้แล้วทิ้ง)** ซึ่งเป็นอุปกรณ์สำคัญในงานบริการยุคปัจจุบัน โดยเฉพาะในบริการแบบ Grab & Go, Executive Lounge, งานจัดเลี้ยง (Banquet) หรือบริเวณทางออกจากห้องอาหารเช้าครับ\\n\\n*(หมายเหตุ: สำหรับกาแฟร้อน โรงแรมมาตรฐานจะนิยมใช้แก้วกระดาษทนความร้อน (Paper Cup) พร้อมฝาพลาสติก ส่วนแก้วพลาสติกใส (Clear Plastic Cup) จะนิยมใช้กับกาแฟเย็นครับ)*\\n\\nขอแนะนำรายละเอียดทั้ง 4 ด้านที่บริกรมืออาชีพต้องรู้ ดังนี้ครับ:\\n\\n---\\n\\n### 1. คำศัพท์สำคัญ (Key Vocabulary)\\n\\n*   **Disposable Cup** (ทิส-โป-ซะ-เบิล คัพ) = แก้วแบบใช้แล้วทิ้ง\\n*   **Paper Cup / Hot Cup** = แก้วกระดาษสำหรับเครื่องดื่มร้อน\\n*   **Sip Lid / Coffee Lid** (สิป ลิด) = ฝาครอบแก้วกาแฟ (แบบมีช่องสำหรับจิบ)\\n*   **Cup Sleeve / Heat Sleeve** (คัพ สลีฟ) = ปลอกกระดาษกันความร้อน\\n*   **Wooden Stirrer** (วู้ด-เดน สเทอร์-เรอร์) = ไม้คนกาแฟ\\n*   **To-go / Takeaway** = นำกลับ (สั่งกลับบ้าน)\\n*   **Eco-friendly / Biodegradable** = เป็นมิตรต่อสิ่งแวดล้อม / ย่อยสลายได้ตามธรรมชาติ\\n\\n---\\n\\n### 2. ประโยคสนทนาภาษาอังกฤษและสถานการณ์จริง (Conversations)\\n\\n**สถานการณ์ที่ 1: การสอบถามความต้องการของลูกค้า (Dine-in or To-go)**\\n> **Server:** \\"Good morning, sir/madam. Would you prefer your coffee to stay in a ceramic mug, or in a disposable cup to go?\\"\\n> *(อรุณสวัสดิ์ครับ/ค่ะ รับกาแฟทานที่นี่ใส่แก้วเซรามิก หรือใส่แก้วแบบนำกลับดีครับ/คะ?)*\\n\\n**สถานการณ์ที่ 2: การบริการส่งมอบกาแฟพร้อมอุปกรณ์เสริฟ**\\n> **Server:** \\"Here is your Hot Latte to go. I’ve put a heat sleeve on for you. Would you like a lid and a wooden stirrer?\\"\\n> *(นี่คือฮอตลาเต้สำหรับนำกลับครับ/ค่ะ ผม/ดิฉันใส่ปลอกกันความร้อนให้แล้ว รับฝาครอบและไม้คนกาแฟเพิ่มไหมครับ/คะ?)*\\n\\n**สถานการณ์ที่ 3: ข้อแนะนำด้านความปลอดภัย (เมื่อปิดฝาแก้ว)**\\n> **Server:** \\"Please be careful, the coffee is very hot. The lid is securely fastened. Have a wonderful day!\\"\\n> *(โปรดระมัดระวังนะครับ/ค่ะ กาแฟร้อนมาก ฝาปิดแน่นหนาเรียบร้อยแล้ว ขอให้เป็นวันที่ดีครับ/ค่ะ!)*\\n\\n---\\n\\n### 3. การจัดวางและการเตรียมอุปกรณ์ (Placement & Setup)\\n\\nแม้จะเป็นแก้วใช้แล้วทิ้ง แต่การจัดวางในโรงแรมต้องเรียบร้อยและได้มาตรฐาน衛生 (Hygiene):\\n\\n1.  **จุดบริการ (Grab & Go / Breakfast Exit):**\\n    *   วางแก้วซ้อนกันใน **Dispenser (ที่ใส่แก้ว)** หรือวาง **คว่ำลง (Upside down)** บนถาดสะอาดเพื่อป้องกันฝุ่น\\n2.  **การจัดวางอุปกรณ์ประกอบ:**\\n    *   วาง **Lids (ฝา)**, **Sleeves (ปลอกกันความร้อน)** และ **Stirrers (ไม้คน)** ใส่ในกล่องจัดระเบียบ (Organizer Box) แยกหมวดหมู่ชัดเจน\\n3.  **ไม่อยู่บนโต๊ะอาหารแบบ Formal:** แก้ว Disposable จะไม่นำมาวางเซ็ตบนโต๊ะอาหารมื้อหลัก (Formal Dining Table) แต่จะให้บริการตามคำร้องขอ หรือบริเวณ Counter บริการตนเองเท่านั้น\\n\\n---\\n\\n### 4. มาตรฐานการบริการและข้อควรระวัง (Service Standards & Tips)\\n\\n*   **Hygiene First (สุขอนามัยเป็นสำคัญ):** *ข้อห้ามสำคัญที่สุด* คือ **ห้ามจับบริเวณขอบแก้ว (Rim)** หรือ **ด้านในของฝา (Inside of the lid)** โดยเด็ดขาด ให้จับที่ตัวแก้วส่วนกลางหรือส่วนล่างเท่านั้น\\n*   **Safety Check:** สำหรับเครื่องดื่มร้อน ต้องใส่ **Heat Sleeve** ให้ลูกค้าเสมอ และตรวจสอบว่าฝาปิดสนิท (ได้ยินเสียง \\"คลิก\\") ก่อนส่งมอบให้ลูกค้า เพื่อป้องกันเครื่องดื่มหกหกใส่ลูกค้า\\n*   **Sustainability Mindfulness:** หากโรงแรมใช้แก้วย่อยสลายได้ สามารถแนะนำลูกค้าสั้นๆ เพื่อสร้างความประทับใจได้ เช่น *\\"We use 100% biodegradable cups to support sustainability.\\"*\\n\\n---\\n\\nลองนำประโยคเหล่านี้ไปฝึกใช้ดูนะครับ หากผู้เรียนมีข้อสงสัยเพิ่มเติมเกี่ยวกับการบริการเครื่องดื่มชนิดอื่นๆ สอบถามผมใน **FINE MODEL** ได้ตลอดเวลาเลยครับ สู้ๆ ครับ!"}]	2026-08-26 18:58:33.319807+07	\N
953b48fd-0d7a-4ea0-ab5d-3ec1b57b7d4c	00000000-0000-0000-0000-000000000003	gemini_chat	General Conversation	[{"role": "model", "text": "สวัสดีครับ! ผมคือ AI ผู้ช่วยของ FINE MODEL"}, {"role": "user", "text": "ช่วยแนะนำคำศัพท์ Herbal Dropper Bottle สั้นๆ ครับ"}, {"role": "model", "text": "สวัสดีครับผู้เรียน ยินดีต้อนรับสู่ FINE MODEL ครับ! \\n\\nสำหรับคำศัพท์ **Herbal Dropper Bottle** มีความหมายและบริบทการใช้งานในสายงาน Food & Beverage (F&B) สั้นๆ ดังนี้ครับ\\n\\n*   **คำอ่าน:** เฮอร์-เบิล ดรอป-เพอร์ บอท-เทิล\\n*   **ความหมาย:** **ขวดหยดสมุนไพร** (ขวดแก้วขนาดเล็กที่มีฝาเป็นหลอดหยด/Pipette)\\n*   **การใช้งานในงาน F&B:** ใช้สำหรับใส่ของเหลวเข้มข้น รสชาติ หรือกลิ่นสมุนไพร เช่น **Bitters** (เหล้าขม), **Tinctures** (สารสกัดสมุนไพร), หรือ **Essential Oils** (น้ำมันหอมระเหยสำหรับอาหาร) เพื่อใช้ตวงลงในเครื่องดื่มหรือจานอาหารด้วยความแม่นยำระดับ \\"หยด\\" \\n\\n---\\n\\n**🍹 สถานการณ์จริงในบริการ (Real-World Scenario):**\\nในบาร์ระดับ Fine Dining หรือ Craft Cocktail Bar บาร์เทนเดอร์จะนำ **Herbal Dropper Bottle** ที่บรรจุสารสกัดลาเวนเดอร์ (Lavender Tincture) มาใช้:\\n\\n> **Bartender:** *\\"I am adding just two drops of organic lavender tincture from this **herbal dropper bottle** to elevate the floral aroma of your Gin Fizz.\\"*\\n> *(ผมกำลังหยดสารสกัดลาเวนเดอร์ออร์แกนิก 2 หยดจากขวดหยดสมุนไพร เพื่อเพิ่มกลิ่นหอมของดอกไม้ให้กับเครื่องดื่ม Gin Fizz ของคุณครับ)*\\n\\nคำนี้ถือเป็นอุปกรณ์สำคัญในงาน Mixology และการตกแต่งอาหารยุคใหม่ (Modern Gastronomy) ที่ช่วยเพิ่มความประณีตให้กับการบริการครับ! หากผู้เรียนมีคำศัพท์ไหนอยากรู้อีก สอบถามผมได้เสมอเลยนะครับ 😊"}]	2026-08-26 18:59:22.512357+07	\N
b9562be1-352f-4f50-bc3a-298b827677cf	00000000-0000-0000-0000-000000000003	gemini_chat	Learning Conversation	[{"role": "model", "text": "สวัสดีครับ! ผมคือ AI ผู้ช่วยของ FINE MODEL 🎓\\n\\nผมพร้อมช่วยคุณเรียนรู้การบริการอาหารและเครื่องดื่ม ถามผมได้เลยครับ!\\n\\n💡 ลองถามเกี่ยวกับ:\\n• การทักทายลูกค้าภาษาอังกฤษ\\n• มาตรฐาน Table Setting\\n• การรับออร์เดอร์อาหาร"}, {"role": "user", "text": "ช่วยแนะนำคำศัพท์ ประโยคสนทนาภาษาอังกฤษ และการจัดวาง/การบริการของ \\"Paper Coffee Cup\\" (แก้วกาแฟกระดาษ) ในฐานะบริกรโรงแรมให้หน่อยครับ"}, {"role": "model", "text": "สวัสดีครับผู้เรียน ยินดีต้อนรับสู่การเรียนรู้ด้านศิลปะการบริการอาหารและเครื่องดื่มครับ! \\n\\nถึงแม้ **Paper Coffee Cup (แก้วกาแฟกระดาษ)** จะดูเป็นอุปกรณ์ที่ง่ายๆ แต่ในโรงแรมระดับมาตรฐาน การบริการแก้วกระดาษสำหรับบริการแบบ Takeaway (รับกลับ) หรือบริการในงานจัดเลี้ยง (Banquet/Conference) ก็มีรายละเอียดที่ช่วยสร้างความประทับใจให้แก่แขกได้ครับ\\n\\nผู้ช่วยสอนได้สรุปคำศัพท์ ประโยคสนทนา และมาตรฐานการบริการมาให้ดังนี้ครับ:\\n\\n---\\n\\n### 1. Essential Vocabulary (คำศัพท์สำคัญ)\\n*   **Paper Coffee Cup** (เพ-เพอร์ คอฟ-ฟี คัพ): แก้วกาแฟกระดาษ\\n*   **Double-walled Cup** (ดับ-เบิล-วอลด์ คัพ): แก้วกระดาษหนา 2 ชั้น (กันความร้อนได้ดีโดยไม่ต้องใส่ปลอก)\\n*   **Coffee Lid / Sip Lid** (คอฟ-ฟี ลิด / ซิป ลิด): ฝาแก้วกาแฟ (แบบมีช่องดื่ม)\\n*   **Cup Sleeve / Coffee Jacket** (คัพ สลีฟ / คอฟ-ฟี แจ็ก-เก็ต): ปลอกกระดาษกันความร้อน\\n*   **Wooden Stirrer** (วูด-เดน สเตอร์-เรอร์): ไม้คนกาแฟแบบไม้\\n*   **Drink Carrier / Cup Holder** (ดริงก์ แคริเออร์ / คัพ โฮล-เดอร์): ถาดกระดาษสำหรับถือแก้วกาแฟ (เมื่อสั่งหลายแก้ว)\\n*   **To-go / Takeaway** (ทู-โก / เทค-อะเวย์): นำกลับบ้าน / นำออกนอกสถานที่\\n\\n---\\n\\n### 2. Useful English Phrases (ประโยคสนทนาภาษาอังกฤษ)\\n\\n**การเสนอการบริการ (Offering & Asking):**\\n*   \\"Would you like your coffee **here or to go**?\\" \\n    *(คุณลูกค้ารับกาแฟทานที่นี่หรือรับกลับดีครับ/ค่ะ?)*\\n*   \\"Allow me to put a **sleeve** on your cup so it’s not too hot.\\"\\n    *(ขออนุญาตใส่ปลอกกันความร้อนให้นะครับ/ค่ะ จะได้ไม่ร้อนมือ)*\\n*   \\"Would you like a **lid** for your coffee?\\"\\n    *(ต้องการฝาปิดแก้วกาแฟด้วยไหมครับ/ค่ะ?)*\\n*   \\"Would you like a **drink carrier** for these cups?\\"\\n    *(ต้องการถาดกระดาษสำหรับถือแก้วพวกนี้ไหมครับ/ค่ะ? - ใช้เมื่อสั่ง 2 แก้วขึ้นไป)*\\n\\n---\\n\\n### 3. Service & Placement Standards (การจัดวางและการบริการ)\\n\\n1.  **สุขอนามัยสำคัญที่สุด (Hygiene First):**\\n    *   **ห้าม** สัมผัสบริเวณขอบปากแก้ว (Rim) หรือด้านในของฝาแก้วเด็ดขาด ให้จับที่ส่วนกลางหรือส่วนล่างของตัวแก้วเสมอ\\n    *   สวมใส่ปลอกกระดาษ (Sleeve) ให้เรียบร้อย **ก่อน** เทเครื่องดื่มร้อนลงไป\\n2.  **การจัดวางโลโก้ (Logo Alignment):**\\n    *   หมุนด้านที่มี **โลโก้ของโรงแรม/ร้าน** หันหน้าเข้าหาแขกเสมอ\\n    *   การปิดฝา (Lid) ให้จัดให้ช่องดื่ม (Sip hole) อยู่ตรงข้ามหรือตั้งฉากกับโลโก้ เพื่อความสวยงามเวลากิน\\n3.  **การตั้งบนเคาน์เตอร์/ซุ้มกาแฟ (Coffee Station Setting):**\\n    *   หากวางซ้อนกัน (Stacking) ให้ **คว่ำแก้วลง** บนถาดสะอาด เพื่อป้องกันฝุ่นละออง\\n    *   ฝาปิดแก้ว (Lids) ควรใส่ในกล่องจ่ายฝา (Lid dispenser) หรือวางคว่ำในซ้อนที่สะอาด\\n    *   จัดวางไม้คนกาแฟ (Stirrer) และซองน้ำตาลให้อยู่ในฝั่งขวามือของแก้ว\\n\\n---\\n\\n### 4. Real-World Scenario (สถานการณ์จริง)\\n\\n**สถานการณ์:** แขกเร่งรีบมาสั่งกาแฟที่คอฟฟี่บาร์ของโรงแรมเพื่อไปประชุม\\n\\n**Waiter:** \\"Good morning, sir! What can I get for you today?\\"\\n*(อรุณสวัสดิ์ครับคุณผู้ชาย รับเครื่องดื่มอะไรดีวันนี้ครับ?)*\\n\\n**Guest:** \\"A Hot Americano, please. I’m in a bit of a hurry.\\"\\n*(ขอฮอตอเมริกาโน่แก้วนึงครับ พอดีผมรีบนิดหน่อย)*\\n\\n**Waiter:** \\"Certainly, sir. Would you like that **to go** in a paper cup?\\"\\n*(ได้เลยครับคุณผู้ชาย รับเป็นแบบนำกลับใส่แก้วกระดาษนะครับ?)*\\n\\n**Guest:** \\"Yes, please.\\"\\n*(ครับ)*\\n\\n*(บริกรชงกาแฟ ใส่ปลอกกันความร้อน ปิดฝาอย่างถูกสุขอนามัย และหันโลโก้เข้าหาแขก)*\\n\\n**Waiter:** \\"Here is your Hot Americano. I’ve added a **sleeve** and a **lid** for your convenience. Please be careful, it's very hot. Have a great meeting!\\"\\n*(อเมริกาโน่ร้อนได้แล้วครับ ผมใส่ปลอกกันความร้อนและปิดฝาเรียบร้อยแล้ว ระวังร้อนนะครับ ขอให้การประชุมเป็นไปได้ด้วยดีครับ!)*\\n\\n---\\n\\nลองนำคำศัพท์และเทคนิคเหล่านี้ไปฝึกซ้อมดูนะครับ มีข้อสงสัยเพิ่มเติมเกี่ยวกับการบริการประเภทอื่น สอบถามผู้ช่วยสอนได้ตลอดเวลาเลยครับ! 😊"}]	2026-08-26 19:53:58.312034+07	\N
04100b1d-96e5-4108-b1ab-e951a46a1a85	00000000-0000-0000-0000-000000000003	gemini_chat	Learning Conversation	[{"role": "model", "text": "สวัสดีครับ! ผมคือ AI ผู้ช่วยของ FINE MODEL 🎓\\n\\nผมพร้อมช่วยคุณเรียนรู้การบริการอาหารและเครื่องดื่ม ถามผมได้เลยครับ!\\n\\n💡 ลองถามเกี่ยวกับ:\\n• การทักทายลูกค้าภาษาอังกฤษ\\n• มาตรฐาน Table Setting\\n• การรับออร์เดอร์อาหาร"}, {"role": "user", "text": "ช่วยแนะนำคำศัพท์ ประโยคสนทนาภาษาอังกฤษ และการจัดวาง/การบริการของ \\"Paper Hot Drink Cup\\" (แก้วกระดาษใส่เครื่องดื่มร้อน) ในฐานะบริกรโรงแรมให้หน่อยครับ"}, {"role": "model", "text": "สวัสดีครับผู้เรียน ยินดีต้อนรับสู่บทเรียน F&B Service ครับ! \\n\\nแก้วกระดาษใส่เครื่องดื่มร้อน (**Paper Hot Drink Cup**) ในโรงแรมมักใช้ในบริการประเภท **Grab & Go, Executive Lounge, การจัดเลี้ยงนอกสถานที่ (Outdoor Catering)** หรือบริการอาหารเช้าสำหรับแขกที่รีบไปทำงานครับ ถึงแม้จะเป็นแก้วกระดาษ แต่มารยาทและการบริการระดับโรงแรมยังต้องเน้นความประณีตและความปลอดภัยครับ\\n\\nครูขอสรุปสาระสำคัญให้ดังนี้ครับ:\\n\\n---\\n\\n### 1. คำศัพท์ภาษาอังกฤษที่ควรรู้ (Vocabulary)\\n\\n*   **Paper Hot Cup** (น.): แก้วกระดาษใส่เครื่องดื่มร้อน\\n*   **Cup Sleeve / Coffee Jacket** (น.): ปลอกกระดาษกันร้อนสำหรับสวมแก้ว\\n*   **Lid** (น.): ฝาปิดแก้ว\\n*   **Sip Hole / Drinking Hole** (น.): ช่องสำหรับยกดื่มบนฝา\\n*   **Stirrer / Wooden Stirrer** (น.): ไม้สำหรับคนเครื่องดื่ม\\n*   **Coaster** (น.): จานรองแก้ว / แผ่นรองแก้ว\\n*   **Eco-friendly / Biodegradable** (คุณ.): เป็นมิตรต่อสิ่งแวดล้อม / ย่อยสลายได้ตามธรรมชาติ\\n*   **To-go / Takeaway** (คุณ./น.): สำหรับนำกลับบ้าน/นำออกไปข้างนอก\\n\\n---\\n\\n### 2. ประโยคสนทนาภาษาอังกฤษสำหรับบริกร (Useful Phrases)\\n\\n**เมื่อเสนอขายหรือสอบถามความต้องการ:**\\n*   *\\"Would you like your coffee in a takeaway paper cup, Sir/Madam?\\"* \\n    (รับกาแฟเป็นแก้วกระดาษสำหรับนำกลับไหมครับ/ค่ะ?)\\n*   *\\"Would you prefer a lid on your cup?\\"* \\n    (ต้องการให้ปิดฝาแก้วด้วยไหมครับ/ค่ะ?)\\n\\n**เมื่อเสิร์ฟพร้อมเตือนความปลอดภัย (สำคัญมาก):**\\n*   *\\"Here is your hot Cappuccino. Please be careful, it is very hot.\\"*\\n    (นี่คือคาปูชิโน่ร้อนครับ/ค่ะ ระวังนิดนึงนะครับ เครื่องดื่มร้อนมาก)\\n*   *\\"I have put a sleeve on the cup for your comfort.\\"*\\n    (ผม/ดิฉัน ใส่ปลอกกันร้อนไว้ที่แก้วให้เรียบร้อยแล้วครับ/ค่ะ)\\n\\n---\\n\\n### 3. การจัดวางและการบริการ (Setup & Service Techniques)\\n\\n1.  **การจัดวางในพื้นที่บริการ (Setup):**\\n    *   หากวางในสเตชั่นกาแฟ (Coffee Station): วางซ้อนแก้วกระดาษให้เป็นระเบียบ ไม่สูงเกินไป วางฝาปิด (Lids) และปลอกกันร้อน (Sleeves) แยกใส่ภาชนะให้หยิบง่ายและสะอาด\\n    *   หากเสิร์ฟบนโต๊ะ: วางแก้วโดยให้ **โลโก้โรงแรมหันหน้าเข้าหาแขก** เสมอ และควรวางบน **Coaster (กระดาษรองแก้ว)** เพื่อความสวยงาม\\n\\n2.  **เทคนิคการบริการ (Service Standard):**\\n    *   **ระดับการเท (Fill Level):** ไม่เทเครื่องดื่มจนเต็มขอบแก้ว ให้เว้นระยะจากขอบแก้วประมาณ **1/2 นิ้ว (1.2 ซม.)** เพื่อป้องกันเครื่องดื่มหกหรือลวกมือแขกขณะปิดฝา\\n    *   **สุขอนามัย (Hygiene):** ขณะจับฝาแก้ว **ห้ามแตะต้องบริเวณ Sip Hole (ช่องยกดื่ม)** เด็ดขาด ให้จับเฉพาะขอบฝาด้านนอกเท่านั้น\\n    *   **ความปลอดภัย (Safety):** เครื่องดื่มที่มีความร้อนสูง ต้องใส่ **Cup Sleeve** ให้แขกเสมอ\\n\\n---\\n\\n### 4. ตัวอย่างสถานการณ์จริง (Real-life Scenario)\\n\\n**สถานการณ์:** แขกพักในโรงแรมกำลังรีบไปประชุมตอนเช้า และมาขอรับกาแฟที่ Executive Lounge\\n\\n**(Guest walks up to the counter looking in a hurry)**\\n\\n*   **Staff (You):** \\"Good morning, Mr. Smith! Heading out for a meeting?\\"\\n    *(อรุณสวัสดิ์ครับคุณสมิธ กำลังจะออกไปประชุมหรือเปล่าครับ?)*\\n*   **Guest:** \\"Yes, I am. I don't have time for breakfast, but I really need a coffee.\\"\\n    *(ใช่ครับ ผมไม่มีเวลาทานอาหารเช้าเลย แต่ต้องการกาแฟด่วนมาก)*\\n*   **Staff (You):** \\"I can prepare a fresh Latte in a **to-go paper cup** for you. It will only take two minutes.\\"\\n    *(ผมเตรียมลาเต้ร้อนใส่แก้วกระดาษแบบนำกลับให้ได้ครับ ใช้เวลาแค่ 2 นาทีครับ)*\\n*   **Guest:** \\"That would be fantastic, thank you!\\"\\n    *(เยี่ยมเลย ขอบคุณมากครับ!)*\\n*   **(Staff prepares the drink with a sleeve and lid, then hands it over using both hands)**\\n*   **Staff (You):** \\"Here is your hot Latte, Mr. Smith. **Please be careful, it’s quite hot.** Have a successful meeting today!\\"\\n    *(ได้แล้วครับลาเต้ร้อนของคุณสมิธ ระวังความร้อนด้วยนะครับ ขอให้การประชุมวันนี้ราบรื่นครับ!)*\\n\\n---\\n\\nมีข้อสงสัยเพิ่มเติมเกี่ยวกับคำศัพท์หรือขั้นตอนการบริการส่วนไหน ถามครูต่อได้เลยนะครับ! พร้อมสนับสนุนการเรียนรู้ครับ 😊"}, {"role": "user", "text": "thank you"}, {"role": "model", "text": "You're very welcome! (ยินดีมาก ๆ ครับ 😊)\\n\\nขอให้สนุกกับการเรียนรู้และการฝึกฝนทักษะ F&B Service นะครับ หากมีคำศัพท์ ประโยคภาษาอังกฤษ หรือขั้นตอนการจัดโต๊ะและบริการอาหารและเครื่องดื่มเรื่องไหนอยากเรียนรู้เพิ่มเติม สามารถสอบถามครูได้เสมอเลยนะครับ! \\n\\nGood luck with your practice!"}]	2026-08-26 21:30:58.583708+07	2026-08-26 21:31:30.744+07
\.


--
-- Data for Name: class_invites; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.class_invites (short_code, target_class, teacher_name, school_name, created_at, expires_at, class_id, created_by, max_uses, use_count, revoked_at) FROM stdin;
\.


--
-- Data for Name: class_students; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.class_students (id, class_id, student_id, enrolled_at) FROM stdin;
d0ffa38d-8037-4b94-a4cb-e07da1e1bb21	22222222-2222-2222-2222-222222222201	00000000-0000-0000-0000-000000000003	2026-09-16 10:13:29.118983+07
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.classes (id, school_id, teacher_id, name, description, year, semester, is_active, created_at) FROM stdin;
22222222-2222-2222-2222-222222222201	11111111-1111-1111-1111-111111111111	00000000-0000-0000-0000-000000000020	ปวช.1 สาขาวิชาการโรงแรม	ห้องเรียน ปวช.1 สาขาวิชาการโรงแรม รายวิชาการบริการอาหารและเครื่องดื่ม	2567	1	t	2026-09-16 10:13:29.118983+07
\.


--
-- Data for Name: content_library; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.content_library (id, content_type, name_th, name_en, unit_label, status, created_by, created_at, updated_at) FROM stdin;
20000000-0000-0000-0000-000000000001	AR Object	เครื่องชงกาแฟ Espresso	Espresso Machine	Unit 1	published	\N	2026-08-26 18:06:42.172863+07	2026-08-26 18:06:42.172863+07
20000000-0000-0000-0000-000000000002	AR Object	แก้วไวน์แดงทรง Bordeaux	Red Wine Glass	Unit 1	published	\N	2026-08-26 18:06:42.172863+07	2026-08-26 18:06:42.172863+07
20000000-0000-0000-0000-000000000003	AI Scan	จานอาหารหลัก	Main Course Plate	Unit 2	published	\N	2026-08-26 18:06:42.172863+07	2026-08-26 18:06:42.172863+07
20000000-0000-0000-0000-000000000004	Simulation	รับลูกค้าเข้าร้านอาหาร	Guest Arrival Scenario	Unit 3	published	\N	2026-08-26 18:06:42.172863+07	2026-08-26 18:06:42.172863+07
20000000-0000-0000-0000-000000000005	Lesson	มาตรฐานการจัดโต๊ะแบบยุโรป	European Table Setting Standard	Unit 2	draft	\N	2026-08-26 18:06:42.172863+07	2026-08-26 18:06:42.172863+07
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.courses (id, title, title_en, description, thumbnail_url, created_by, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.enrollments (id, student_id, course_id, class_id, enrolled_at, completed_at) FROM stdin;
\.


--
-- Data for Name: fine_lesson_plans; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.fine_lesson_plans (id, title, subject, level, term, duration, target_class, weeks, concept, objectives_k, objectives_s, objectives_a, objectives_ap, vocabulary, sentences, activities_lead, activities_f, activities_i, activities_n, activities_e, activities_wrap, teacher_name, teacher_email, created_at, updated_at, teacher_id, class_id, published_at, publication_status) FROM stdin;
lesson-plan-week-1	แผนการจัดการเรียนรู้ สัปดาห์ที่ 1: Cutlery and Glassware Vocabulary	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 1	การเรียนรู้คำศัพท์และอุปกรณ์ในห้องอาหาร เป็นพื้นฐานสำคัญของการปฏิบัติงานบริการอาหารและเครื่องดื่ม ผู้เรียนจำเป็นต้องมีความรู้เกี่ยวกับชื่ออุปกรณ์ หน้าที่ วิธีการใช้งาน และสามารถสื่อสารภาษาอังกฤษในบริบทงานบริการได้อย่างถูกต้อง โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยีผ่าน web app FINE Model ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษเชิงวิชาชีพและการปฏิบัติงานบริการตามมาตรฐานคุณวุฒิวิชาชีพ	["บอกชื่ออุปกรณ์ในห้องอาหารประเภท Cutlery, Glassware เป็นภาษาอังกฤษได้ถูกต้อง", "อธิบายหน้าที่และการใช้งานของอุปกรณ์บนโต๊ะอาหารแต่ละประเภทได้", "อธิบายหลักการจัดวางอุปกรณ์บนโต๊ะอาหารตามมาตรฐานแบบทั่วไป (Casual) และแบบเป็นทางการ (Formal) ได้"]	["ออกเสียงคำศัพท์อุปกรณ์ในห้องอาหาร และสามารถสื่อสารผ่านระบบ AI ผ่าน web app FINE Model ได้ถูกต้อง", "ใช้เทคโนโลยี AR เพื่อสแกนและเรียนรู้โมเดลอุปกรณ์ 3D ผ่าน web app FINE Model ได้", "จำแนก และจัดวางอุปกรณ์บนโต๊ะอาหาร ในสถานการณ์จำลอง (Simulation) ได้ถูกต้องตามตำแหน่งและหลักการ \\"หยิบจากข้างนอก เข้าข้างใน\\" (Outside - In)"]	["ความรับผิดชอบและวินัยในการปฏิบัติงานตามขั้นตอน", "ความกล้าแสดงออกและมั่นใจในการใช้ภาษาอังกฤษเพื่อการสื่อสาร", "ทักษะการทำงานร่วมกับผู้อื่น และทำงานเป็นทีม (Teamwork)", "เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม"]	["เลือกใช้อุปกรณ์ในห้องอาหารได้เหมาะสมกับประเภทการบริการ", "จัดวางอุปกรณ์บนโต๊ะอาหารตามสถานการณ์ที่กำหนดได้อย่างถูกต้อง", "ประยุกต์ใช้คำศัพท์ภาษาอังกฤษ ในการอธิบายอุปกรณ์และการจัดโต๊ะอาหารในสถานการณ์จำลองได้"]	["Dinner Fork", "Dinner Knife", "Soup Spoon", "Dessert Spoon", "Teaspoon", "Water Goblet", "Red Wine Glass", "White Wine Glass", "Juice Glass", "Champagne Glass"]	["This is a Dinner Knife. It is used for the main course.", "A Soup Spoon is used for soup.", "This is a Water Goblet.", "We use Water Goblet for water.", "What is this equipment? - This is a water goblet."]	1. ครูเปิดวิดีโอเพื่อกระตุ้นการเรียนรู้ "Food & Beverage Terminology Explained | Essential Hotel & Restaurant Vocabulary" เพื่อให้ผู้เรียนเห็นภาพรวมบรรยากาศห้องอาหารระดับมาตรฐานสากลและอุปกรณ์ต่างๆ\n2. กิจกรรมกระตุ้นความคิด (Brainstorming): ครูใช้คำถาม เพื่อเชื่อมโยงประสบการณ์เดิมของผู้เรียน:\n  - "จากวิดีโอ นักเรียนเห็นอุปกรณ์ประเภทเครื่องแก้วหรือช้อนส้อมอะไรบ้าง?"\n  - "หากเราเข้าไปในห้องอาหาร Fine Dining แล้วหยิบใช้อุปกรณ์ผิดประเภท จะส่งผลต่อภาพลักษณ์ของพนักงานและห้องอาหารอย่างไร?"\n3. ผู้เรียนร่วมกันแชร์ความคิดเห็น อย่างอิสระ ครูเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)\n1. ครูแจก Worksheet คำศัพท์อุปกรณ์ห้องอาหาร\n2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning เพื่อสแกนดูโมเดลอุปกรณ์ 3D (Cutlery และ Glassware)\n3. ผู้เรียนจับคู่กลุ่มคำศัพท์ภาษาอังกฤษกับภาพโมเดลเสมือนจริงใน Worksheet\n4. ภารกิจกลุ่มย่อย: ผู้เรียนเดินสำรวจห้องปฏิบัติการ และจับคู่คำศัพท์ที่ได้จาก AR นำไปวางคู่กับ "อุปกรณ์จริง" (Tableware Set) บนโต๊ะปฏิบัติงาน เพื่อสร้างความคุ้นเคย\n5. ภารกิจ AI Scan Learning ผู้เรียนใช้ AI Scan วิเคราะห์อุปกรณ์จริงในห้องปฏิบัติการ เช่น Dinner Fork, Water Goblet, Soup Spoon จากนั้นศึกษาข้อมูลที่ระบบแสดงผล (ข้อมูลด้านวิชาชีพ, คำศัพท์ภาษาอังกฤษ, ตัวอย่างประโยค, ตัวอย่างบทสนทนา) และบันทึกผลลงใน AI Scan Learning Record	การปฏิสัมพันธ์ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)\n1. ครูมอบหมายภารกิจฝึกออกเสียง และแต่งประโยคเพื่อสื่อสาร โดยใช้ผ่าน web app FINE Model\n2. ผู้เรียนฝึกออกเสียงคำศัพท์เดี่ยว และฝึกพูดประโยคระบุหน้าที่ของอุปกรณ์ตามโครงสร้าง:\n  - "This is a [Dinner Knife]. It is used for [the main course]."\n  - "A [Soup Spoon] is used for [soup]."\n3. Pair Work กิจกรรมคู่หู: ผู้เรียนจับคู่ผลัดกันหยิบอุปกรณ์จริงขึ้นมา แล้วถาม-ตอบ โดยมี AI คอยจับเสียงและให้ Feedback เรื่องความถูกต้องของสำเนียง (Fluency)\n  - A: "What is this equipment?"\n  - B: "This is a water goblet."	การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)\n1. ครูแบ่งผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรมจำลองสถานการณ์ "Restaurant Table Setup Challenge" (เกมแข่งจัดโต๊ะอาหารพลิกแพลง)\n2. สถานการณ์จำลอง: ครูแจกการ์ดโจทย์ให้แต่ละทีม เช่น "ให้จัดโต๊ะอาหารแบบเป็นทางการ (Formal Western Table Setting) สำหรับเมนูที่มีซุป ปลา อาหารจานหลัก และไวน์ขาว"\n3. ผู้เรียนในทีมต้องช่วยกันระดมสมอง วางแผนเลือกอุปกรณ์ และจัดวางบนโต๊ะตามหลักการ Outside-In และแนวทางที่ถูกต้องทางวิชาชีพ\n4. ครูเพิ่มความท้าทาย โดยการเข้าไปสลับตำแหน่งอุปกรณ์ในระหว่างกิจกรรม เพื่อให้ทีมใช้ทักษะการคิดวิเคราะห์และแก้ปัญหาเฉพาะหน้า (Problem-Solving) ร่วมกัน	การลงมือปฏิบัติจริง (35 นาที)\n1. แต่ละทีมส่งตัวแทน นำเสนอผลงานการจัดโต๊ะอาหารเป็นภาษาอังกฤษ โดยอธิบายชื่อ และลำดับการจัดวางอุปกรณ์ให้ครูและเพื่อนในห้องฟัง\n2. ผู้เรียนทุกคนทำ Quiz ทดสอบคำศัพท์และความเข้าใจรายบุคคล ผ่าน web app FINE Model\n3. ครูประเมินสมรรถนะการปฏิบัติงาน (Performance Assessment) รายกลุ่ม รายบุคคล ด้วยเกณฑ์ Rubrics	ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: การหยิบใช้อุปกรณ์จากด้านนอกเข้าด้านใน, ทิศทางการหันคมมีด, และความสำคัญของการเรียกชื่ออุปกรณ์ให้ถูกต้องเพื่อความเป็นมืออาชีพ\n2. ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์หรือเขียนคำศัพท์อุปกรณ์ที่จำได้แม่นยำที่สุด 5 คำ พร้อมอธิบายหน้าที่สั้นๆ เป็นภาษาอังกฤษส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 10:13:29.118983+07	2026-09-16 10:13:29.118983+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 10:13:29.118983+07	published
lesson-plan-week-2	แผนการจัดการเรียนรู้ สัปดาห์ที่ 2: Food and Beverage Vocabulary & Menu Classification	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 2	การที่ผู้เรียนมีความรู้เข้าใจเกี่ยวกับคำศัพท์ในงานบริการอาหารและเครื่องดื่ม ตลอดจนสามารถจำแนกประเภทของเมนูได้อย่างถูกต้องนั้น ถือเป็นสมรรถนะหลักที่พนักงานบริการอาหารและเครื่องดื่มต้องใช้ในการปฏิบัติงาน ในธุรกิจโรงแรมและภัตตาคาร ซึ่งการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี Augmented Reality (AR) 3D และ Artificial Intelligence (AI) ได้แก่ AI Scan และระบบ Gemini ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาผู้เรียนให้มีทักษะการวิเคราะห์จำแนกประเภทเมนู และพัฒนาทักษะการออกเสียงคำศัพท์ชื่ออาหาร และเครื่องดื่ม ได้อย่างถูกต้องตามมาตรฐานคุณวุฒิวิชาชีพ	["บอกชื่อ และระบุคำศัพท์เกี่ยวกับอาหารและเครื่องดื่ม เป็นภาษาอังกฤษได้ถูกต้อง", "อธิบายและจำแนกประเภทของอาหาร (Appetizers, Main Courses, Desserts) ได้อย่างถูกต้อง", "อธิบายและจำแนกประเภทของเครื่องดื่ม (Non-Alcoholic, Hot/Cold Beverages) ได้อย่างถูกต้อง"]	["ออกเสียงคำศัพท์ชื่ออาหาร เครื่องดื่ม และพูดประโยคที่ใช้สื่อสารผ่านระบบ AI ได้ถูกต้อง", "ใช้เทคโนโลยี AR เพื่อสแกน และศึกษาโมเดลเมนูอาหารเสมือนจริง 3D ได้อย่างคล่องแคล่ว", "จัดหมวดหมู่และแยกประเภทรายการอาหารและเครื่องดื่ม ลงในเล่มเมนูห้องอาหารจำลอง (Simulation) ได้อย่างถูกต้องตามหลักสากล"]	["ความรับผิดชอบ และวินัยในการปฏิบัติงาน", "ความกล้าแสดงออก และมั่นใจในการใช้ภาษาอังกฤษเพื่อการสื่อสาร", "ทักษะการทำงานร่วมกับผู้อื่น ทำงานเป็นทีม (Teamwork)", "เจตคติที่ดีต่อวิชาชีพการโรงแรม และมีใจรักงานบริการ (Service Mind)"]	["เลือกและจัดหมวดหมู่ เมนูอาหาร และเครื่องดื่ม ได้ถูกต้องตามมาตรฐานสากล", "จัดระเบียบเล่มเมนูอาหาร ตามหลักการให้บริการของห้องอาหารจริงได้อย่างถูกต้อง", "ประยุกต์ใช้คำศัพท์ภาษาอังกฤษ ในการบอกประเภทอาหารและเครื่องดื่มในสถานการณ์จำลองได้"]	["Caesar Salad", "Garlic Bread", "Spring Rolls", "Mushroom Soup", "Grilled Ribeye Steak", "Salmon Fillet", "Spaghetti Carbonara", "Roasted Chicken", "Chocolate Lava Cake", "Tiramisu", "Panna Cotta", "Ice Cream Vanilla", "Mineral Water", "Orange Juice", "Soft Drinks", "Virgin Mojito", "Espresso", "Cappuccino", "Iced Americano", "Hot Green Tea"]	["Caesar Salad is categorized as an appetizer.", "Spaghetti Carbonara is categorized as a main course.", "Chocolate Lava Cake is categorized as a dessert.", "Virgin Mojito belongs to non-alcoholic beverages.", "We serve Virgin Mojito as a refreshing mocktail.", "Espresso belongs to hot beverages.", "How is Caesar Salad categorized? - Caesar Salad is categorized as an appetizer."]	1. ครูเปิดวิดีโอกระตุ้นการเรียนรู้เกี่ยวกับ "เมนูและการจำแนกประเภทอาหารและเครื่องดื่มในโรงแรมระดับ 5 ดาว" เพื่อให้ผู้เรียนเห็นภาพรวมของการจัดประเภทของเมนูอาหาร ได้อย่างเป็นระบบ\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถาม เพื่อเชื่อมโยงประสบการณ์เดิมของผู้เรียน:\n   - "ถ้าห้องอาหารนำเมนู Steak ของคาว ไปปนอยู่ในหมวดของหวาน (Desserts) จะเกิดผลกระทบอย่างไรต่อการทำงานของพนักงานและการสั่งอาหารของลูกค้า?"\n   - "ทำไมในเมนูสากลต้องแยกหมวดหมู่เครื่องดื่มไม่มีแอลกอฮอล์ (Non-Alcoholic) ออกจากหมวดหมู่อื่นๆ ให้ชัดเจน?"\n3. ผู้เรียนร่วมกันแชร์ความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้ในสัปดาห์นี้	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี AR 3D Objects (60 นาที)\n1. ครูแจก Worksheet คำศัพท์อาหารและเครื่องดื่มประจำสัปดาห์\n2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning สแกนดูโมเดลอาหารและเครื่องดื่มเสมือนจริง 3D แบบรอบด้าน\n3. ผู้เรียนจับคู่คำศัพท์ภาษาอังกฤษกับโมเดล 3D ที่พบบนระบบลงในช่องตามหมวดหมู่ (Appetizer, Main Course, Dessert, Beverage) บน Worksheet\n4. ภารกิจ AI Scan Learning: ผู้เรียนใช้ฟีเจอร์ AI Scan สแกนภาพหรือโมเดลอาหารและเครื่องดื่มจำลองในห้องปฏิบัติการเพื่อวิเคราะห์ เช่น Spaghetti Carbonara, Caesar Salad, Virgin Mojito จากนั้นทำการศึกษาข้อมูลด้านวิชาชีพ, คำศัพท์, ตัวอย่างประโยค และตัวอย่างบทสนทนาการเสิร์ฟ ที่ระบบแสดง แล้วบันทึกผลลงใน AI Scan Learning Record	การปฏิสัมพันธ์ผ่านเทคโนโลยี AI Support (50 นาที)\n1. ครูมอบหมายภารกิจฝึกออกเสียงและแต่งประโยคระบุประเภทอาหาร โดยใช้ผ่าน web app FINE Model\n2. ผู้เรียนฝึกออกเสียงคำศัพท์และฝึกพูดประโยคแสดงการจำแนกประเภทเมนูตามโครงสร้าง:\n   - "Spaghetti Carbonara is categorized as a main course."\n   - "Virgin Mojito belongs to non-alcoholic beverages."\n3. Pair Work กิจกรรมคู่: ผู้เรียนจับคู่ผลัดกันสุ่มหยิบการ์ดเมนูอาหารและเครื่องดื่มขึ้นมา จากนั้นฝึกถาม-ตอบ และออกเสียงผ่าน Voice Command โดยมีระบบ AI คอยตรวจสอบและให้คำแนะนำ (AI Feedback ผ่าน web app FINE Model) ในเรื่องของสำเนียง ความถูกต้อง และการเน้นเสียง (Stress)\n   - A: "How is Caesar Salad categorized?"\n   - B: "Caesar Salad is categorized as an appetizer."	การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)\n1. ครูแบ่งผู้เรียนออกเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรมจำลองสถานการณ์ “The Menu Master Challenge” (เกมแข่งจัดระเบียบเมนูห้องอาหาร)\n2. สถานการณ์จำลอง: ครูแจกชุดการ์ดรายการอาหารและเครื่องดื่มภาษาอังกฤษแบบผสมกัน (คละหมวดหมู่) และบอร์ดจำลองโครงสร้างเมนูร้านอาหาร (Restaurant Menu Board) ให้แก่แต่ละกลุ่ม\n3. ผู้เรียนในทีมต้องระดมสมอง ร่วมกันวิเคราะห์ และคัดแยกรายการการ์ดเหล่านั้นไปจัดหมวดหมู่ลงบนบอร์ดให้ถูกต้องตามตำแหน่งโครงสร้างบริการสากล (Appetizers -> Main Courses -> Desserts -> Beverages) ภายในเวลาที่จำกัด\n4. ครูเพิ่มความท้าทายโดยสอดแทรก "เมนูแปลกใหม่หรือเมนูฟิวชั่น" ในระหว่างทำกิจกรรม เพื่อให้แต่ละทีมได้ใช้ทักษะการคิดวิเคราะห์ ค้นหาข้อมูล และแก้ไขปัญหาเฉพาะหน้าอย่างเป็นระบบ	การลงมือปฏิบัติจริง (35 นาที)\n1. แต่ละทีมส่งตัวแทนออกนำเสนอผลงานการจัดเล่มเมนูจำลองภาษาอังกฤษ โดยอธิบายหลักการแบ่งหมวดหมู่และชื่อเมนูพิเศษ ประจำกลุ่มให้ครูและเพื่อนร่วมชั้นฟัง\n2. ผู้เรียนทุกคนทำ Quiz ทดสอบความรู้เกี่ยวกับคำศัพท์และความแม่นยำ ในการจำแนกประเภทเมนูเป็นรายบุคคล ผ่าน web app FINE Model\n3. ครูประเมินสมรรถนะการปฏิบัติงาน (Performance Assessment) รายกลุ่ม และรายบุคคลด้วยเกณฑ์ Rubrics	ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญของการจำแนกประเภทเมนู (Menu Classification) และประโยชน์ของระบบ AI (ผ่าน web app FINE Model) ที่ช่วยให้การออกเสียงคำศัพท์ยากๆ เป็นเรื่องง่ายและจำได้\n2. ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์หรือเขียนสรุปองค์ประกอบของเมนู โดยยกตัวอย่างชื่ออาหารจานหลัก 2 เมนู, ของหวาน 2 เมนู และเครื่องดื่ม 1 เมนู เป็นภาษาอังกฤษส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 17:13:50.143451+07	2026-09-16 17:25:30.285413+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 17:25:30.285413+07	published
lesson-plan-week-3	แผนการจัดการเรียนรู้ สัปดาห์ที่ 3: Table Setting (Casual & Formal และขั้นตอนการจัดวางอุปกรณ์ตามมาตรฐาน)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 3	การจัดโต๊ะอาหารเป็นหัวใจสำคัญของการเตรียมสภาพแวดล้อมเพื่อให้การบริการอาหารและเครื่องดื่มเป็นไปตามมาตรฐานสากล ผู้เรียนจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับประเภทการจัดโต๊ะอาหาร ได้แก่ แบบทั่วไป (Casual Table Setting) และแบบเป็นทางการ (Formal Table Setting) รวมถึงขั้นตอน กฎเกณฑ์การจัดวางอุปกรณ์ (เช่น กฎ 1 นิ้วจากขอบโต๊ะ และการหยิบใช้อยุปกรณ์จากด้านนอกเข้าด้านใน หรือ Outside-In Rule) ตลอดจนสามารถสื่อสารภาษาอังกฤษ เพื่ออธิบายตำแหน่งการจัดวางอุปกรณ์ได้อย่างถูกต้อง การจัดการเรียนรู้นี้บูรณาการ FINE Model ร่วมกับเทคโนโลยี Augmented Reality (AR 3D Table Setting), ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อยกระดับสมรรถนะ การสื่อสารภาษาอังกฤษด้านวิชาชีพ และการปฏิบัติงานในการจัดโต๊ะอาหารตามมาตรฐานคุณวุฒิวิชาชีพ	["บอกประเภทการจัดโต๊ะอาหารแบบ Casual Table Setting และ Formal Table Setting เป็นภาษาอังกฤษได้ถูกต้อง", "อธิบายขั้นตอน กฎเกณฑ์ และลำดับการจัดวางอุปกรณ์บนโต๊ะอาหารตามมาตรฐานวิชาชีพได้", "อธิบายหลักการจัดวางเครื่องแก้ว จานขนมปัง และผ้าเช็ดปากตามประเภทการบริการได้"]	["ออกเสียงคำศัพท์และประโยคภาษาอังกฤษ ระบุตำแหน่งการจัดโต๊ะอาหารผ่านระบบ AI ได้ถูกต้อง", "ใช้เทคโนโลยี AR เพื่อสแกน และเรียนรู้ผังการจัดโต๊ะอาหารแบบ 3D ได้อย่างคล่องแคล่ว", "จำแนก และลงมือจัดวางอุปกรณ์บนโต๊ะอาหารแบบ Casual และ Formal ในสถานการณ์จำลอง (Simulation) ได้ถูกต้องตามกฎ \\"1 นิ้ว\\" และ \\"Outside - In\\""]	["ความรับผิดชอบ ละเอียดรอบคอบ และมีความประณีตในการจัดวางอุปกรณ์ตามมาตรฐานความสะอาด", "ความกล้าแสดงออก และมั่นใจในการใช้ภาษาอังกฤษสื่อสารและอธิบายรูปแบบการจัดโต๊ะ", "ทักษะการทำงานร่วมกับผู้อื่น ในการจัดเตรียมโต๊ะอาหารจำลอง (Teamwork)", "เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม"]	["เลือกประเภทการจัดโต๊ะอาหาร ให้เหมาะสมกับรูปแบบการบริการ และสถานการณ์ที่กำหนดได้", "ตรวจสอบ และแก้ไขข้อผิดพลาด ในการจัดวางอุปกรณ์บนโต๊ะอาหารตามโจทย์จำลองได้", "ประยุกต์ใช้คำศัพท์และโครงสร้างประโยคภาษาอังกฤษ ในการนำเสนอรูปแบบการจัดโต๊ะอาหารได้อย่างมืออาชีพ"]	["Casual Setting", "Formal Setting", "Centerpiece", "Placemat", "Table Cloth", "Show Plate", "Side Plate (B&B Plate)", "Butter Knife", "Alignment", "Distance"]	["Place the [Dinner Knife] to the right of the plate with the blade facing inward.", "Keep a distance of one inch from the edge of the table.", "The Water Goblet is placed directly above the dinner knife.", "The bread plate is on the left side of the forks.", "The [Dinner Knife] goes on the right side of the plate.", "Place the [Water Goblet] above the dinner knife at a 45-degree angle."]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูเปิดวิดีโอกระตุ้นการเรียนรู้ “Table Setting Rules & Standards: Casual vs. Formal Table Setting” เพื่อให้ผู้เรียนเห็นเปรียบเทียบการจัดโต๊ะอาหารทั้งสองรูปแบบในโรงแรมระดับสากล\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเชื่อมโยงประสบการณ์:\n   - “จากการดูวิดีโอ การจัดโต๊ะแบบ Casual และ Formal มีความแตกต่างกันอย่างไร?”\n   - “ทำไมมีดอาหารจานหลักต้องหันคมมีดเข้าหาจาน และต้องเว้นระยะห่างจากขอบโต๊ะ 1 นิ้ว?”\n3. ผู้เรียนร่วมกันแสดงความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่จุดประสงค์การเรียนรู้เรื่อง Table Setting	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี AR 3D & AI Scan (60 นาที)\n1. ครูแจก Worksheet เรื่อง "Table Setting Layouts & Rules"\n2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning สแกนดูผังโมเดล 3D การจัดโต๊ะอาหารแบบ Casual และ Formal\n3. ผู้เรียนศึกษาตำแหน่งการจัดวาง (เช่น จาน, ช้อน, ส้อม, มีด, แก้วน้ำ, แก้วไวน์, จานขนมปัง) ผ่าน AR และจับคู่ชื่ออุปกรณ์กับตำแหน่งใน Worksheet\n4. ภารกิจ AI Scan Learning: ผู้เรียนใช้ AI Scan ผ่าน web app FINE Model สแกนโต๊ะอาหารตัวอย่างที่ครูจัดไว้ในห้องปฏิบัติการ เพื่อศึกษาวิเคราะห์ ประเภทของการเซ็ตโต๊ะ, ระยะห่างและทิศทางของอุปกรณ์, ประโยคภาษาอังกฤษอธิบายตำแหน่งการจัดวาง แล้วบันทึกข้อมูลที่ได้ลงใน AI Scan Learning Record (Table Setting Edition)	การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support (50 นาที)\n1. ครูมอบหมายภารกิจฝึกออกเสียง และสร้างประโยคสนทนาในการระบุตำแหน่งการจัดโต๊ะอาหาร โดยใช้ผ่าน web app FINE Model ตามโครงสร้างประโยค:\n   - "The [Dinner Knife] goes on the right side of the plate."\n   - "Place the [Water Goblet] above the dinner knife at a 45-degree angle."\n2. Pair Work กิจกรรมคู่: ผู้เรียนจับคู่กัน โดยคนหนึ่งเป็นผู้สั่งคำสั่งภาษาอังกฤษ (Instructor) และอีกคนเป็นผู้ปฏิบัติจัดวางอุปกรณ์จริงบนโต๊ะ (Setter) โดยเปิด Gemini Live ช่วยฟังเสียง เพื่อประเมินความถูกต้องของสำเนียงและการใช้คำศัพท์	การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)\n1. ครูแบ่งกลุ่มผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรม “Table Setting Simulation Challenge”\n2. สถานการณ์จำลอง: ครูแจกการ์ดโจทย์สถานการณ์จำลองให้แต่ละทีม เช่น:\n   - โจทย์ A: "จงเซ็ตโต๊ะแบบ Formal Western Table Setting สำหรับอาหาร 4 คอร์ส (Soup, Fish, Main Course, Dessert) พร้อมแก้วไวน์แดงและไวน์ขาว"\n   - โจทย์ B: "จงเซ็ตโต๊ะแบบ Casual Dining สำหรับอาหารกลางวัน 2 คอร์ส พร้อมจัดวาง B&B Plate และ Water Goblet ให้ถูกต้อง"\n3. สมาชิกในทีมระดมสมอง วางแผน เลือกอุปกรณ์ และจัดวางอุปกรณ์ลงบนโต๊ะ ให้ถูกต้องตามกฎ 1 นิ้ว และ Outside-In\n4. การเพิ่มความท้าทาย (Problem-Solving): ครูเปลี่ยนตำแหน่งอุปกรณ์บางชิ้น หรือปรับระยะให้ผิดเกณฑ์ 1 นิ้ว เพื่อให้ทีมช่วยกันตรวจสอบ คิดวิเคราะห์ และแก้ไขข้อผิดพลาดให้ถูกต้องตามมาตรฐาน	การลงมือปฏิบัติจริง (35 นาที)\n1. Each team sends a representative to present their table setup in English: อธิบายประเภทการจัดโต๊ะ ลำดับการจัดวาง และการใช้กฎ 1 นิ้ว / Outside-In ให้ครูและเพื่อนฟัง\n2. ผู้เรียนทุกคนทำ Quiz ทดสอบความเข้าใจเรื่อง Table Setting Rules & Layouts รายบุคคลผ่าน web app FINE Model\n3. ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่ม (Performance Assessment) ด้วยเกณฑ์ Rubrics	ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: ความประณีตในการจัดโต๊ะ กฎ 1 นิ้ว ทิศทางใบมีด การวางแก้วน้ำ และความสำคัญของการจัดโต๊ะตามมาตรฐานสากลต่อภาพลักษณ์โรงแรม\n2. Exit Ticket: ผู้เรียนเขียนสรุปกฎการจัดโต๊ะอาหารภาษาอังกฤษ 3 ข้อ (เช่น 1-inch distance, Blade inward, Outside-In placement) ส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 17:34:09.962469+07	2026-09-16 17:34:09.962469+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 17:34:09.962469+07	published
lesson-plan-week-4	แผนการจัดการเรียนรู้ สัปดาห์ที่ 4: Service Equipment (จำแนกประเภท ชนิด การดูแลรักษา สุขอนามัย และการจัดเตรียมอุปกรณ์)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 4	การรู้จัก จำแนกประเภท และใช้งานเครื่องมืออุปกรณ์ในการบริการอาหารและเครื่องดื่ม (Service Equipment) ถือเป็นทักษะพื้นฐานสำคัญของพนักงานบริการในอุตสาหกรรมโรงแรม ผู้เรียนจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับประเภทของอุปกรณ์ ได้แก่ จานกระเบื้อง (Chinaware), เครื่องเงิน/ช้อนส้อมมีด (Flatware/Cutlery), เครื่องแก้ว (Glassware), ผ้าที่ใช้ในห้องอาหาร (Linen) และภาชนะโลหะ/ภาชนะโปร่ง (Hollowware) รวมถึงหลักการดูแลรักษา การทำความสะอาด (Polishing) การจับถืออุปกรณ์อย่างถูกสุขลักษณะ (Hygiene Handling) ตลอดจนการสื่อสารภาษาอังกฤษ เพื่อระบุชื่อและหน้าที่ของอุปกรณ์แต่ละชนิดได้อย่างถูกต้อง การจัดการเรียนรู้นี้บูรณาการ FINE Model ร่วมกับเทคโนโลยี Augmented Reality ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษเชิงวิชาชีพและการปฏิบัติงานเตรียมอุปกรณ์ตามมาตรฐานคุณวุฒิวิชาชีพ	["บอกชื่อ และจำแนกประเภทอุปกรณ์ในงานบริการอาหารและเครื่องดื่ม 5 หมวดหมู่หลัก (Chinaware, Cutlery, Glassware, Linen, Hollowware) เป็นภาษาอังกฤษได้ถูกต้อง", "อธิบายวิธีการดูแลรักษา การทำความสะอาด (Polishing) และหลักการจัดเก็บอุปกรณ์แต่ละประเภทตามมาตรฐานวิชาชีพได้", "อธิบายหลักสุขอนามัยในการจับ ถืออุปกรณ์ในงานบริการแต่ละชนิดได้ถูกต้อง"]	["ออกเสียงคำศัพท์และประโยคภาษาอังกฤษระบุชื่อและหน้าที่ของอุปกรณ์ผ่านระบบ AI ได้ถูกต้อง", "ใช้เทคโนโลยี AR 3D และ AI Scan ผ่าน web app FINE Model เพื่อสแกน จำแนก และตรวจสอบสภาพของอุปกรณ์ให้พร้อมใช้งานได้", "ปฏิบัติงานเช็ดทำความสะอาด (Polishing) แก้วและเครื่องเงินด้วยไอน้ำ รวมถึงจับถืออุปกรณ์ได้อย่างถูกต้อง"]	["ความรอบคอบ และระมัดระวังในการจับถืออุปกรณ์เพื่อความปลอดภัยในการทำงาน", "การคำนึงถึงความสำคัญของความสะอาดและสุขอนามัย (Hygiene Concept) ในการปฏิบัติงานบริการ", "ความกล้าแสดงออกและความมั่นใจในการใช้ภาษาอังกฤษสื่อสาร", "ทักษะการทำงานร่วมกับผู้อื่น และการบริหารจัดการเวลา ในการจัดเตรียมอุปกรณ์"]	["เลือกใช้อุปกรณ์ในงานบริการอาหารและเครื่องดื่มได้ถูกต้อง เหมาะสมตามรายการอาหาร (Menu) และสถานการณ์ที่กำหนดได้", "ตรวจสอบ คัดแยก และแก้ไขปัญหาในกรณีที่อุปกรณ์ที่ไม่พร้อมใช้งาน (เช่น มีรอยคราบ ตำหนิ หรือชำรุด)", "ประยุกต์ใช้คำศัพท์และโครงสร้างประโยคภาษาอังกฤษ ในการแนะนำการใช้งานของอุปกรณ์ได้"]	["Stemware", "Tumbler", "Cutlery", "Flatware", "Chinaware", "Hollowware", "Linen", "Polishing", "Sanitizing", "Service Cloth", "Handle with care", "Rim", "Base"]	["This is a [Water Goblet], used for serving iced water.", "Always hold the wine glass by the stem to keep it clean and maintain the wine temperature.", "Please polish the cutlery with hot steam and a dry linen cloth.", "Check the glassware for any cracks or spots before placing it on the table.", "This is a [Fish Knife]. It is used for eating fish dishes.", "Always hold the glass by its stem to avoid leaving fingerprints."]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูเปิดวิดีโอ “Professional Equipment Handling & Polishing Standards in 5-Star Hotels” เพื่อให้ผู้เรียนเห็นมาตรฐานการจัดการอุปกรณ์บริการ และสุขอนามัย\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามกระตุ้นความคิด:\n   - “ทำไมพนักงานบริการถึงห้ามจับบริเวณขอบแก้ว (Rim) หรือหน้าสัมผัสของจานโดยเด็ดขาด?”\n   - “หากลูกค้าพบรอยนิ้วมือหรือคราบน้ำบนแก้วไวน์ จะส่งผลต่อภาพลักษณ์ของโรงแรมอย่างไร?”\n3. ผู้เรียนร่วมกันแสดงความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่จุดประสงค์การเรียนรู้เรื่อง Service Equipment	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี AR 3D & AI Scan (60 นาที)\n1. ครูแจก Worksheet เรื่อง "Service Equipment Identification & Hygiene Rules"\n2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning สแกนดูโมเดล 3D ของอุปกรณ์บริการทั้ง 5 หมวด (Chinaware, Cutlery, Glassware, Linen, Hollowware)\n3. ผู้เรียนศึกษารายละเอียด ชื่อภาษาอังกฤษ และหน้าที่การใช้งานผ่าน AR พร้อมบันทึกลงใน Worksheet\n4. ภารกิจ AI Scan Learning: ผู้เรียนใช้ AI Scan ผ่าน web app FINE Model สแกนอุปกรณ์จริง ที่จัดวางไว้ในห้องปฏิบัติการ เพื่อศึกษาวิเคราะห์: ชื่อเรียกอุปกรณ์ภาษาอังกฤษและหมวดหมู่, ตำแหน่งจุดจับถือที่ถูกต้องตามหลักสุขอนามัย, ประโยคภาษาอังกฤษอธิบายการใช้งานของอุปกรณ์ และบันทึกข้อมูลลงใน AI Scan Learning Record (Equipment Edition)	การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support (50 นาที)\n1. ครูมอบหมายภารกิจฝึกออกเสียงคำศัพท์และแต่งประโยคอธิบายอุปกรณ์ โดยใช้ผ่าน web app FINE Model\n2. ผู้เรียนฝึกแต่งประโยคอธิบายตามโครงสร้าง:\n   - “This is a [Fish Knife]. It is used for eating fish dishes.”\n   - “Always hold the glass by its stem to avoid leaving fingerprints.”\n3. Pair Work กิจกรรมคู่: ผู้เรียนจับคู่กัน โดยคนหนึ่งเป็น "Head Server" ทำหน้าที่สุ่มชี้อุปกรณ์และถามคำถามภาษาอังกฤษ อีกคนเป็น "Junior Server" หยิบถืออุปกรณ์อย่างถูกวิธีพร้อมตอบชื่อและหน้าที่ โดยใช้ผ่าน web app FINE Model ช่วยฟังเสียงเพื่อประเมินความถูกต้องของสำเนียงและการใช้คำศัพท์	การเรียนรู้ผ่านสถานการณ์จำลอง SBL (55 นาที)\n1. ครูแบ่งกลุ่มผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรม “Equipment Selection & Polishing Challenge”\n2. สถานการณ์จำลอง: ครูแจกการ์ดรายการอาหาร (Menu Card) ให้แต่ละทีม เช่น:\n   - โจทย์ A: "เมนู 3 คอร์ส: Cream of Mushroom Soup, Grilled Salmon with Herb Butter, and Chocolate Mousse พร้อมบริการไวน์ขาวและน้ำดื่ม"\n   - โจทย์ B: "เมนู 3 คอร์ส: Caesar Salad, Ribeye Steak, and Apple Pie พร้อมบริการไวน์แดงและน้ำดื่ม"\n3. สมาชิกในทีมระดมสมอง วางแผน เลือกอุปกรณ์ (Chinaware, Cutlery, Glassware) ให้ตรงกับเมนู และนำอุปกรณ์มาเข้ากระบวนการ Polishing (เช็ดทำความสะอาดด้วยไอน้ำ) ให้เงางาม ปราศจากคราบ\n4. การเพิ่มความท้าทาย (Problem-Solving): ครูแอบปะปนอุปกรณ์ที่มีคราบ คราบรอยนิ้วมือ หรืออุปกรณ์ผิดประเภทลงในคลัง ให้ผู้เรียนคัดแยก ตรวจสอบ และแก้ไขให้ถูกต้องก่อนนำส่งตรวจ	การลงมือปฏิบัติจริง (35 นาที)\n1. ตัวแทนแต่ละทีมออกมานำเสนออุปกรณ์ที่เลือก และสาธิตวิธีการเช็ด/จับถืออุปกรณ์เป็นภาษาอังกฤษหน้าชั้นเรียน\n2. ผู้เรียนทุกคนทำ Quiz ทดสอบความรู้เรื่อง Service Equipment Identification & Handling รายบุคคลผ่าน web app FINE Model\n3. ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่ม (Performance Assessment) ด้วยเกณฑ์ Rubrics	ขั้นสรุปและสะท้อนคิด (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: การคัดเลือกอุปกรณ์ให้เหมาะกับเมนู หลักสุขอนามัยในการจับถือ และเทคนิคการ Polishing ให้ถูกต้อง\n2. Exit Ticket: ผู้เรียนเขียนชื่ออุปกรณ์ภาษาอังกฤษ 3 ชนิด พร้อมระบุจุดที่ต้องจับถืออย่างถูกสุขลักษณะ ส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 17:40:25.447206+07	2026-09-16 17:40:25.447206+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 17:40:25.447206+07	published
lesson-plan-week-5	แผนการจัดการเรียนรู้ สัปดาห์ที่ 5: Greeting and Welcoming Guests (การกล่าวต้อนรับและการแนะนำตนเอง)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 5	การกล่าวต้อนรับและการแนะนำตนเอง (Greeting and Welcoming Guests) เป็นประตูด่านแรกในการสร้างความประทับใจ และความเชื่อมั่นให้แก่ผู้รับบริการ พนักงานบริการจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับขั้นตอนการต้อนรับ การใช้ภาษาท่าทาง (Body Language) ที่สุภาพ และการเลือกใช้สำนวนภาษาอังกฤษสำหรับงานบริการ (Expressions for Restaurant Service) ได้อย่างถูกต้องเหมาะสมตามช่วงเวลา และประเภทของลูกค้า โดยการจัดการเรียนรู้นี้ได้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยี Augmented Reality (AR) และ Artificial Intelligence (AI) ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษ ตามมาตรฐานคุณวุฒิวิชาชีพได้	["ระบุขั้นตอนและหลักการต้อนรับลูกค้า (Greeting) ตามมาตรฐานของธุรกิจอาหารและเครื่องดื่มได้ถูกต้อง", "จำแนกสำนวน และประโยคภาษาอังกฤษที่ใช้ในการกล่าวต้อนรับ และการแนะนำตนเองตามระดับความเป็นทางการได้", "อธิบายหลักการใช้ภาษาท่าทาง (Non-verbal Communication) เช่น การสบตา การยิ้ม และการผายมือที่ถูกต้องได้"]	["ออกเสียงการต้อนรับภาษาอังกฤษ และโต้ตอบบทสนทนากับระบบ AI ได้ถูกต้อง", "ปฏิบัติทักษะการต้อนรับลูกค้าและแนะนำตนเองร่วมกับภาษาที่ถูกต้อง และท่าทางที่สุภาพในสถานการณ์จำลองได้", "ปรับปรุงระดับเสียง ท่วงทำนอง และความเร็วในการพูดภาษาอังกฤษโดยอาศัยข้อมูลจากระบบ AI ได้"]	["บุคลิกภาพที่สุภาพ มียิ้มแย้ม แจ่มใส และมีจิตบริการ (Service Mind)", "ความกล้าแสดงออกและความมั่นใจในการสื่อสารภาษาอังกฤษ", "ทักษะการทำงานร่วมกับผู้อื่นและพร้อมรับฟังคำแนะนำเพื่อการพัฒนาตนเอง"]	["เลือกใช้สำนวนการกล่าวต้อนรับ และแนะนำตนเองได้เหมาะสมกับประเภทของลูกค้าในสถานการณ์จำลอง", "ประยุกต์ใช้ทักษะภาษาอังกฤษ และบุคลิกภาพงานบริการในการต้อนรับลูกค้า ณ หน้าห้องอาหารจำลองได้", "แก้ไขสถานการณ์เฉพาะหน้า ในการต้อนรับได้อย่างเหมาะสม"]	["Reservation", "Welcome", "Server", "Proxemics", "Eye Contact", "Body Language", "First Impression", "Host/Hostess"]	["Good morning/afternoon/evening, sir/madam. Welcome to [Restaurant Name].", "My name is [Name], and I will be your server for today.", "Do you have a reservation, sir/madam?", "A table for how many persons, please?", "Right this way, please. Let me show you to your table."]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูจัดกิจกรรม Role-play โดยครูสวมบทบาทเป็นลูกค้าชาวต่างชาติเดินเข้ามาในห้องเรียนด้วยท่าทางสับสน จากนั้นขอให้ผู้เรียนลองเข้ามาทักทายและต้อนรับ\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อเชื่อมโยงประสบการณ์และนำเข้าสู่บทเรียน:\n   - “จากที่เพื่อนๆ ได้ลองเข้ามาทักทาย ประโยคใดที่ทำให้ลูกค้ารู้สึกอบอุ่นและประทับใจมากที่สุด?”\n   - “นอกจากคำพูดแล้ว ท่าทาง การยืน หรือการสบตา มีผลต่อความรู้สึกของลูกค้าใน 3 วินาทีแรกอย่างไรบ้าง?”\n3. ผู้เรียนร่วมกันแชร์ความคิดเห็น ครูสรุปและเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้เรื่องการต้อนรับและการแนะนำตนเอง	ขั้นทำความคุ้นเคย ผ่านบทสนทนา (60 นาที)\n1. ครูแจก Worksheet เรื่อง "Professional Greeting & Self-Introduction Expressions"\n2. ผู้เรียนศึกษาโครงสร้างประโยคมาตรฐาน สำหรับการทักทายลูกค้าตามช่วงเวลา การแนะนำตนเองในฐานะพนักงานดูแลโต๊ะ และประโยคสอบถามเรื่องการจองโต๊ะอาหาร\n3. ครูสาธิตการใช้น้ำเสียง ท่วงทำนอง (Intonation) และภาษาท่าทางที่ถูกต้อง เช่น ระยะห่างในการยืน (Proxemics) การสบตา (Eye Contact) และการไหว้หรือผายมือตามมาตรฐานโรงแรม\n4. ผู้เรียนฝึกฝนการออกเสียงตามครูพร้อมกันทั้งห้องเรียน และฝึกจับคู่สลับกันอ่านออกเสียงเพื่อสร้างความคุ้นเคยกับโครงสร้างประโยค	การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support (50 นาที)\n1. ครูมอบหมายให้ผู้เรียนใช้ Smartphone/Tablet ในการเข้าใช้ web app FINE Model เพื่อฝึกทักษะการฟังและการโต้ตอบภาษาอังกฤษรายบุคคล\n2. ผู้เรียนป้อนคำสั่ง (Prompt) จำลองสถานการณ์ให้ web app FINE Model รับบทเป็นลูกค้าต่างชาติที่เพิ่งเดินเข้ามาในห้องอาหาร จากนั้นผู้เรียนเปิดฟังก์ชันเสียงใน web app FINE Model เพื่อฝึกพูดกล่าวต้อนรับ แนะนำตนเอง และสอบถามข้อมูลการจองโต๊ะเป็นภาษาอังกฤษแบบเรียลไทม์\n3. ระบบใน web app FINE Model จะทำหน้าที่โต้ตอบและให้คำแนะนำป้อนกลับ (Feedback) เกี่ยวกับความถูกต้องของไวยากรณ์ ความเร็วในการพูด และความชัดเจนของสำเนียง ผู้เรียนฝึกฝนซ้ำๆ จนกว่าจะเกิดความมั่นใจและผ่านเกณฑ์การประเมินจากระบบ AI	การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน Restaurant Simulation (55 นาที)\n1. ครูแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 4-5 คน เพื่อจัดกิจกรรมในพื้นที่จำลอง Restaurant Simulation (หน้าประตูล็อบบี้ห้องอาหาร)\n2. สถานการณ์จำลอง: แต่ละกลุ่มจะได้รับ "การ์ดบทบาทลูกค้า" ที่มีความหลากหลาย เช่น ลูกค้าธุรกิจที่รีบร้อน, ลูกค้าครอบครัวที่มีเด็กเล็ก, หรือลูกค้าชาวต่างชาติที่ไม่มีการจองโต๊ะล่วงหน้า\n3. สมาชิกในกลุ่มต้องผลัดกันสวมบทบาทเป็น พนักงานต้อนรับ (Host/Hostess) และ พนักงานบริการ (Server) ในการเดินเข้าไปทักทาย แนะนำตนเอง และแก้ไขปัญหาตามสถานการณ์ที่ได้รับ โดยใช้สำนวนภาษาอังกฤษและภาษากายที่สุภาพ\n4. ครูคอยสังเกตการณ์ ให้คำแนะนำ และเพิ่มความท้าทายหน้างาน เพื่อทดสอบไหวพริบและการแก้ปัญหาเฉพาะหน้าของผู้เรียน	การลงมือปฏิบัติจริง (35 นาที)\n1. สมาชิกแต่ละกลุ่มส่งตัวแทนออกมาปฏิบัติการต้อนรับลูกค้า และแนะนำตนเองใน Restaurant Simulation เพื่อทดสอบสมรรถนะรายบุคคล\n2. ผู้เรียนคนอื่นๆ ร่วมกันวิเคราะห์และประเมินผลการแสดงออกของเพื่อน โดยเน้นที่บุคลิกภาพ น้ำเสียง และความถูกต้องของภาษา\n3. ผู้เรียนทุกคนทำ Quiz ออนไลน์ผ่าน web app FINE Model เพื่อทดสอบความรู้ความเข้าใจเกี่ยวกับสำนวนและขั้นตอนการต้อนรับตามมาตรฐานสากล\n4. ครูประเมินสมรรถนะการณ์ ในการปฏิบัติงานของผู้เรียนรายกลุ่ม และรายบุคคลด้วยเกณฑ์ Rubrics	ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: หัวใจของการต้อนรับคือความจริงใจและความสุภาพ, สำนวนภาษาอังกฤษที่เหมาะสมช่วยยกระดับมาตรฐานห้องอาหาร, และการนำข้อผิดพลาดจากการฝึกฝนร่วมกับ web app FINE Model มาพัฒนาบุคลิกภาพของตนเอง\n2. ผู้เรียนทำกิจกรรม Exit Ticket: เขียนประโยคกล่าวต้อนรับ และแนะนำตนเอง ในบทบาทที่ได้รับ แต่ยังคงความสุภาพเป็นภาษาอังกฤษคนละ 1 ชุด พร้อมบอกความรู้สึกหลังการฝึกปฏิบัติ ส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 17:42:58.063238+07	2026-09-16 17:42:58.063238+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 17:42:58.063238+07	published
lesson-plan-week-6	แผนการจัดการเรียนรู้ สัปดาห์ที่ 6: Seating Guests and Small Talk (การเชิญลูกค้านั่งโต๊ะและการสนทนาเบื้องต้น)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 6	การพาลูกค้าไปนั่งที่โต๊ะอาหารและการชวนสนทนาเบื้องต้น (Seating Guests and Small Talk) เป็นขั้นตอนสำคัญในการสร้างความคุ้นเคย และความรู้สึกอบอุ่นให้แก่ลูกค้าก่อนการเริ่มต้นสั่งอาหาร พนักงานบริการจำเป็นต้องเรียนรู้ทักษะการเดินนำทาง การดึงเก้าอี้และผายมือเชิญนั่งที่ถูกต้องตามหลักสากล ตลอดจนการเลือกใช้สำนวนภาษาอังกฤษในการเริ่มบทสนทนาทั่วไป (Small Talk) ที่สุภาพ ไม่ละลาบละล้วง และช่วยสร้างความสัมพันธ์อันดี (Rapport) ระหว่างพนักงานกับลูกค้า โดยการจัดการเรียนรู้นี้ได้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model เพื่อมุ่งเน้นให้ผู้เรียนเกิดความเชี่ยวชาญด้านบุคลิกภาพวิชาชีพและการสื่อสารอย่างเป็นธรรมชาติ	["ระบุลำดับขั้นตอนและหลักการเชิญลูกค้านั่งโต๊ะ (Seating Procedure) ตามมาตรฐานระดับสากลได้ถูกต้อง", "อธิบายความหมาย และหัวข้อที่เหมาะสมในการสนทนาเบื้องต้น (Small Talk Topics) กับลูกค้าต่างชาติได้", "จำแนกรูปประโยคภาษาอังกฤษที่ใช้ในการผายมือ เชิญนั่ง และการสอบถามความพึงพอใจเรื่องโต๊ะอาหารได้"]	["ปฏิบัติท่าทางการเดินนำ การผายมือ และการดึงเก้าอี้เชิญลูกค้านั่งได้อย่างนุ่มนวลและถูกพิกัดความปลอดภัย", "สื่อสารโต้ตอบบทสนทนาภาษาอังกฤษทั่วไป และตอบรับข้อมูลจากลูกค้าผ่าน web app FINE Model ได้อย่างเป็นธรรมชาติและถูกต้อง", "ประยุกต์ใช้สำนวนการสนทนาเพื่อสร้างความสัมพันธ์อันดีกับลูกค้าในบริบทห้องอาหารจำลองได้อย่างเหมาะสม"]	["ความช่างสังเกต มีไหวพริบ และความเอาใจใส่ต่อความต้องการของลูกค้า (Attentiveness)", "บุคลิกภาพดี มั่นใจ และน่าเชื่อถือตามมาตรฐานงานบริการส่วนหน้าของห้องอาหาร", "เจตคติที่ดีในการต้อนรับ และใช้ภาษาอังกฤษเพื่อสร้างความประทับใจ"]	["เลือกใช้หัวข้อในการพูดคุย (Small Talk) ได้สอดคล้องกับบรรยากาศและลักษณะของลูกค้าแต่ละบุคคล", "ปรับเปลี่ยนพฤติกรรมการบริการ และการต้อนรับตามข้อมูลสะท้อนกลับที่ได้รับจากระบบ AI ผ่าน web app FINE Model", "จัดการระบบลำดับความสำคัญในการพาลูกค้าต่างรูปแบบ (เช่น ผู้สูงอายุ หรือผู้มาติดต่อธุรกิจ) ไปยังโต๊ะที่เหมาะสมได้"]	["Seating Procedure", "Small Talk", "Safe Topics", "Taboo Topics", "Rapport", "Attentiveness", "Front of the House", "Awkward Silence"]	["Please follow me, sir/madam. Your table is this way.", "Allow me, sir/madam.", "Is this table suitable for you?", "How was your journey to the restaurant today?", "How are you enjoying the weather today?", "Is this your first time visiting our city?"]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูจัดสถานการณ์สมมติในห้องเรียน โดยครูทำหน้าที่เดินนำผู้เรียนคนหนึ่งไปยังเก้าอี้ แต่แกล้งเดินเร็วเกินไป ดึงเก้าอี้เสียงดัง และไม่พูดคุยใดๆ ตลอดทาง เพื่อให้ผู้เรียนคนอื่นๆ สังเกตและวิเคราะห์พฤติกรรม\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อเชื่อมโยงเข้าสู่เนื้อหาบทเรียน:\n   - “จากเหตุการณ์จำลองเมื่อครู่ นักเรียนคิดว่าพนักงานขาดทักษะด้านใดบ้าง และส่งผลต่อความรู้สึกของลูกค้าอย่างไร?”\n   - “ระยะทางจากประตูห้องอาหารไปยังโต๊ะที่นั่ง หากปล่อยให้เกิดความเงียบ (Awkward Silence) นานเกินไป เราจะใช้การสนทนาประเภทใดมาช่วยสร้างบรรยากาศให้ดีขึ้น?”\n3. ผู้เรียนร่วมกันอภิปรายและแสดงความคิดเห็น ครูสรุปข้อมูลเพื่อนำเข้าสู่การเรียนรู้เรื่องกระบวนการเชิญลูกค้าไปนั่งโต๊ะ และการทำ Small Talk	ขั้นทำความคุ้นเคย ผ่าน web app FINE Model การเรียนรู้ขั้นตอนและชุดคำศัพท์ (60 นาที)\n1. ครูแจก Worksheet ประจำสัปดาห์เรื่อง "Seating Etiquette & Art of Small Talk"\n2. ผู้เรียนศึกษาลำดับการปฏิบัติงานต้อนรับส่วนหน้าห้องอาหาร: การเดินนำหน้าลูกค้า 1-2 ก้าว, การหันมามองลูกค้าเป็นระยะ, การดึงเก้าอี้ให้ลูกค้าผู้หญิงหรือผู้มีอาวุโสก่อน, และการคลี่ผ้าเช็ด napkin\n3. ผู้เรียนเลือกสำนวนภาษาอังกฤษที่ใช้ในการสนทนาเบื้องต้น โดยครูอธิบายถึงหัวข้อที่ควรนำมาใช้ (Safe Topics) เช่น ดินฟ้าอากาศ การเดินทาง ความสวยงามของสถานที่ และหัวข้อที่ควรหลีกเลี่ยง (Taboo Topics) เช่น การเมือง ศาสนา และเรื่องส่วนตัว\n4. ผู้เรียนฝึกออกเสียงประโยคนำทาง และประโยคคำถามชวนคุยตามครูเพื่อให้เกิดความคุ้นชินในการสนทนา	การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)\n1. ครูให้ผู้เรียนทุกคนเปิดใช้งานเครื่องมือผ่าน web app FINE Model บนอุปกรณ์สื่อสารส่วนบุคคล\n2. ผู้เรียนกำหนดคำสั่งควบคุม (Prompt) เพื่อให้ผ่าน web app FINE Model จำลองบทบาทเป็นลูกค้าประเภทต่างๆ ที่กำลังเดินตามพนักงานไปที่โต๊ะอาหาร\n3. ผู้เรียนฝึกใช้ฟังก์ชันเสียงผ่าน web app FINE Model สื่อสารและสลับกันถาม-ตอบบทสนทนาทั่วไป (Small Talk) แบบต่อเนื่อง โดยพยายามประคับประคองการสนทนาให้ลื่นไหลอย่างน้อย 3-4 ประโยคโต้ตอบ เช่น:\n   - Student: "It is quite a beautiful sunny day today, isn't it?"\n   - Gemini Live: "Yes, it is absolutely lovely! I hope it stays like this all weekend."\n   - Student: "I hope so too. Have you had a chance to explore the city yet?"\n4. ผู้เรียนวิเคราะห์รายงานผลสะท้อนกลับจากระบบ AI ผ่าน web app FINE Model เกี่ยวกับความต่อเนื่องในการพูด (Fluency) และคำศัพท์ที่เลือกใช้ เพื่อนำมาปรับปรุงตนเอง	การเรียนรู้ผ่านสถานการณ์จำลอง Restaurant Simulation (55 นาที)\n1. ครูนำผู้เรียนเข้าสู่พื้นที่ปฏิบัติการห้องอาหารจำลอง Restaurant Simulation ผ่าน web app FINE Model และแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 4-5 คน\n2. สถานการณ์จำลอง: แต่ละกลุ่มส่งตัวแทนมารับ "ใบสั่งการณ์ภารกิจนำนั่ง" ซึ่งมีโจทย์ที่ท้าทายต่างกัน เช่น "พาลูกค้าผู้สูงอายุที่เดินช้าไปยังโต๊ะด้านในพร้อมชวนคุยเรื่องความสะดวกสบายในการเดินทาง" หรือ "พาลูกค้านักธุรกิจที่กำลังคุยโทรศัพท์ไปยังโต๊ะที่เงียบสงบโดยใช้ภาษาท่าทางทดแทนการขัดจังหวะ"\n3. ผู้เรียนในกลุ่มร่วมกันแบ่งหน้าที่และแสดงบทบาทสมมติ (Role-play) โดยครูจะเดินตรวจเช็กพิกัด ท่าทาง ระยะห่างในการเดิน และความสุภาพในการสนทนา\n4. สมาชิกกลุ่มที่เหลือทำหน้าที่เป็นผู้สังเกตการณ์เพื่อจดบันทึกข้อดีและข้อที่ควรปรับปรุงของเพื่อนลงในแบบฟอร์มประเมิน	การลงมือปฏิบัติจริง (35 นาที)\n1. ตัวแทนของแต่ละกลุ่มออกมาสาธิตทักษะการเชิญลูกค้านั่งโต๊ะและการทำ Small Talk ร่วมกันเป็นภาษาอังกฤษใน Restaurant Simulation โดยไม่มีการดูสคริปต์\n2. ครูทำการประเมินสมรรถนะรายบุคคลและรายกลุ่มโดยละเอียดโดยใช้เกณฑ์การประเมินที่กำหนดมาตรฐานไว้\n3. ผู้เรียนทุกคนทำแบบทดสอบความรู้ท้ายสัปดาห์ (Post-test Quiz) ผ่าน web app FINE Model เพื่อประเมินความแม่นยำด้านหลักการและสำนวนภาษาอังกฤษ\n4. ครูประกาศคะแนนและชื่นชมกลุ่มที่แสดงออกได้สอดคล้องตามมาตรฐานวิชาชีพมากที่สุด	ขั้นสรุปและสะท้อนคิด (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสะท้อนความคิดเห็น: การพานั่งโต๊ะไม่ใช่แค่การเดินนำ แต่คือการใส่ใจในความปลอดภัย และสร้างบรรยากาศที่อบอุ่น, ทักษะ Small Talk ช่วยคลายความกังวล และการฝึกซ้อมผ่าน web app FINE Model ช่วยลดความประหม่าในการเจอสถานการณ์จริง\n2. ผู้เรียนทำกิจกรรม Exit Ticket: เขียนสรุปหัวข้อ Small Talk ที่คิดว่าตนเองถนัดและมั่นใจในการชวนลูกค้าคุยมากที่สุด เป็นภาษาอังกฤษ 2 ข้อ ส่งครูก่อนเลิกคาบเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 17:49:44.110295+07	2026-09-16 17:49:44.110295+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 17:49:44.110295+07	published
lesson-plan-week-7	แผนการจัดการเรียนรู้ สัปดาห์ที่ 7: Introducing Menu Items (Food Description: การอธิบายอาหาร ส่วนประกอบ และวิธีการปรุง)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 7	การแนะนำและอธิบายรายการอาหาร (Food Description) เป็นทักษะขั้นสูงที่สำคัญ สำหรับพนักงานบริการอาหารและเครื่องดื่มมืออาชีพ ผู้เรียนจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับคำศัพท์ภาษาอังกฤษที่ใช้อธิบายลักษณะของอาหาร ส่วนประกอบหลัก (Ingredients) และวิธีการปรุง (Cooking Methods) เพื่อสามารถให้ข้อมูลแก่ลูกค้าได้อย่างถูกต้อง น่าดึงดูด และชัดเจน โดยการจัดการเรียนรู้นี้ได้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยีผ่าน web app FINE Model รวมถึงการจำลองสถานการณ์เสมือนจริง เพื่อพัฒนาสมรรถนะการสื่อสารวิชาชีพและการบริการตามมาตรฐานสากล	["ระบุคำศัพท์ภาษาอังกฤษเกี่ยวกับวิธีการปรุงอาหาร (Cooking Methods) และส่วนประกอบหลักได้ถูกต้อง", "อธิบายโครงสร้างรูปประโยคภาษาอังกฤษที่ใช้ในการอธิบายลักษณะอาหาร (Food Descriptions) ได้", "บอกประเภทของวัตถุดิบและส่วนประกอบที่เสี่ยงต่อการแพ้อาหารเบื้องต้นจากชื่อเมนูได้"]	["ออกเสียงคำศัพท์เทคนิคเกี่ยวกับอาหารและวิธีการปรุงได้อย่างถูกต้อง", "ใช้เทคโนโลยี AR + 3D Menu และ AI Scan ผ่าน web app FINE Model เพื่อสืบค้นข้อมูลและวิเคราะห์ส่วนประกอบของอาหารได้", "พูดอธิบายรายละเอียดเมนูอาหารเป็นภาษาอังกฤษโต้ตอบกับระบบ AI ผ่าน web app FINE Model และบุคคลได้"]	["ความใส่ใจในรายละเอียดของอาหารและความต้องการของลูกค้า (Attentiveness)", "ความมั่นใจและบุคลิกภาพที่เหมาะสมในการนำเสนอขายอาหาร (Suggestive Selling)", "ทักษะการทำงานร่วมกันเป็นทีมและความรับผิดชอบต่อบทบาทหน้าที่"]	["เลือกใช้คำศัพท์ที่เหมาะสม (Descriptive Words) ในการอธิบายอาหารเพื่อกระตุ้นความต้องการของลูกค้าได้", "ประยุกต์ใช้ทักษะภาษาอังกฤษ เพื่อแก้ไขปัญหาและตอบคำถามเกี่ยวกับอาหารในสถานการณ์จำลองหน้างานได้", "ปรับเปลี่ยนรูปแบบการอธิบายอาหารให้เหมาะสมกับพฤติกรรมและความต้องการของลูกค้าแต่ละบุคคลได้"]	["Grilled", "Braised", "Roasted", "Steamed", "Poached", "Pan-fried", "Sautéed", "Tender", "Crispy", "Creamy", "Rich", "Savory", "Juicy", "Flavorful", "Seasoned with", "Garnished with", "Served with", "Infused with"]	["This dish is [Grilled Salmon], which is served with asparagus and mashed potatoes.", "It is cooked by pan-frying until the skin is perfectly crispy.", "The beef is braised for 5 hours, making it incredibly tender and flavorful.", "Inside the soup, it contains dairy products and seafood.", "Can you tell me more about this dish?"]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูเปิดคลิปวิดีโอสั้นจำลองบรรยากาศพนักงานบริการระดับมิชลินสตาร์กำลังแนะนำและอธิบาย "เมนูจานเด็ด" ให้ลูกค้าชาวต่างชาติฟัง เพื่อให้ผู้เรียนเห็นภาพความสำคัญของระดับภาษากาย น้ำเสียง และคำศัพท์ที่เลือกใช้\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามท้าทายความคิดผู้เรียน:\n   - "ถ้านักเรียนบอกลูกค้าแค่ว่า 'นี่คือหมูทอด' กับบอกว่า 'นี่คือหมูคุโรบุตะเนื้อนุ่มพิเศษ หมักด้วยสมุนไพรสูตรเฉพาะ นำไปทอดจนกรอบนอกนุ่มใน' แบบไหนจะทำให้ลูกค้ารู้สึกอยากรับประทานมากกว่ากัน?"\n   - "คำศัพท์ภาษาอังกฤษคำใดบ้างที่แปลว่า นุ่ม, กรอบ, หรือ อบ?"\n3. ผู้เรียนร่วมกันตอบคำถามและแชร์คำศัพท์ที่ตนเองรู้จัก ครูทำการเชื่อมโยงเข้าสู่บทเรียนเรื่อง Food Description	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)\n1. ครูแจก Worksheet ประจำสัปดาห์เรื่อง "The Master of Food Descriptions"\n2. ผู้เรียนใช้สมาร์ตโฟนหรือแท็บเล็ตสแกนระบบ AR + 3D Menu เพื่อดูโมเดลอาหาร 3 มิติเสมือนจริงในเมนูจำลอง\n3. ผู้เรียนทำภารกิจ AI Scan Learning โดยการนำกล้องไปสแกนรูปภาพเมนูอาหารหรือโมเดลจำลอง เพื่อให้ระบบ AI Scan วิเคราะห์และแสดงข้อมูล: คำศัพท์ภาษาอังกฤษ, ส่วนประกอบ (Ingredients), วิธีการปรุง (Cooking Methods) และตัวอย่างประโยคอธิบายอาหาร\n4. ผู้เรียนบันทึกข้อมูลที่ได้จากการค้นพบลงใน AI Scan Learning Record เพื่อทำความเข้าใจโครงสร้างและจำแนกประเภทคำศัพท์คุณศัพท์อธิบายอาหาร	การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)\n1. ครูให้ผู้เรียนเปิดแอปพลิเคชันผ่าน web app FINE Model บนอุปกรณ์ส่วนตัว\n2. ผู้เรียนรับบทบาทเป็นพนักงานบริการ ฝึกป้อนคำสั่ง (Prompt) ให้ระบบผ่าน web app FINE Model จำลองตนเองเป็นลูกค้าชาวต่างชาติที่ต้องการทราบรายละเอียดของอาหาร เช่น "Can you tell me more about this dish?" หรือ "How is this chicken prepared?"\n3. ผู้เรียนฝึกสนทนาโต้ตอบผ่านระบบเสียงผ่าน web app FINE Model โดยการอธิบายลักษณะอาหาร วิธีการปรุง และวัตถุดิบตามหัวข้อที่เรียนมา เพื่อให้ระบบ AI จับสัญญาณเสียง ตรวจสอบความถูกต้องของการออกเสียง (Pronunciation) ความคล่องแคล่ว (Fluency) และให้คำแนะนำสะท้อนกลับเพื่อปรับปรุงสำนวนภาษา	การเรียนรู้ผ่านสถานการณ์จำลอง Restaurant Simulation (55 นาที)\n1. ครูแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 4-5 คน และพาเข้าสู่พื้นที่ปฏิบัติการห้องอาหารจำลอง (Restaurant Simulation)\n2. ครูแจกการ์ดโจทย์สถานการณ์จำลองที่พลิกแพลงให้แต่ละกลุ่ม เช่น "กลุ่มที่ 1 ต้องแนะนำเมนูสเต็กเนื้อแก่ลูกค้าที่ชอบเนื้อแบบนุ่มและชุ่มฉ่ำ", "กลุ่มที่ 2 ต้องอธิบายเมนูพาสต้าที่มีส่วนผสมของอาหารทะเลให้ลูกค้าที่มีข้อสงสัยเรื่องวัตถุดิบ"\n3. ผู้เรียนในกลุ่มร่วมกันระดมสมอง วางแผน ออกแบบการพูด นัดแนะจังหวะการแสดงทักษะกายภาพประกอบการพูด (เช่น การผายมือชี้ไปที่รายการอาหารในเล่มเมนู) และทำการฝึกซ้อมร่วมกัน	การลงมือปฏิบัติจริง (35 นาที)\n1. ตัวแทนแต่ละกลุ่มออกมาปฏิบัติภารกิจแนะนำและอธิบายอาหารเป็นภาษาอังกฤษแก่ลูกค้า (รับบทโดยครูหรือเพื่อนต่างกลุ่ม) ในห้องอาหารจำลอง โดยเป็นการแสดงสดโดยไม่ดูโพยหรือสคริปต์\n2. ผู้เรียนทุกคนทำควิซทดสอบออนไลน์ท้ายบทเรียนผ่าน web app FINE Model เพื่อประเมินความจำด้านคำศัพท์และโครงสร้างประโยคอธิบายอาหารรายบุคคล\n3. ครูประเมินสมรรถนะการนำเสนอและการบริการรายกลุ่มด้วยแบบประเมิน Rubric Score และให้คะแนนชื่นชมกลุ่มที่ใช้ทักษะการแนะนำอาหารได้อย่างประทับใจ	ขั้นสรุปและสะท้อนคิด (20 นาที)\n1. Reflection: ครูและผู้เรียนสรุปองค์ความรู้ร่วมกัน: การอธิบายอาหารไม่ใช่เพียงการบอกชื่อวัตถุดิบ แต่คือการใช้คำพูดที่สร้างความประทับใจให้ลูกค้ารู้สึกถึงรสชาติ, การฝึกฝนกับผ่าน web app FINE Model ช่วยให้ผู้เรียนกล้าพูดภาษาอังกฤษ และการใช้ AR + 3D Menu ผ่าน web app FINE Model ช่วยเพิ่มความเข้าใจในรายละเอียดของอาหาร\n2. ผู้เรียนเขียนกิจกรรม Exit Ticket: สรุปคำศัพท์วิธีการปรุงอาหาร 3 คำ และคำคุณศัพท์อธิบายรสชาติ/เนื้อสัมผัส 3 คำเป็นภาษาอังกฤษ พร้อมคำแปล ส่งครูก่อนจบคาบเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 17:56:50.9582+07	2026-09-16 17:56:50.9582+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 17:56:50.9582+07	published
lesson-plan-week-8	แผนการจัดการเรียนรู้ สัปดาห์ที่ 8: Introducing Menu Items (Beverage Recommendation: การแนะนำเครื่องดื่ม ให้ข้อมูลไวน์ การจับคู่อาหาร)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 8	การแนะนำเครื่องดื่มและการให้ข้อมูลเกี่ยวกับไวน์ ตลอดจนการจับคู่เครื่องดื่มกับอาหาร (Beverage Recommendation and Food Pairing) เป็นสมรรถนะวิชาชีพขั้นสูงที่ช่วยยกระดับมาตรฐานการบริการและเพิ่มยอดขายให้แก่ห้องอาหาร พนักงานบริการต้องมีความรู้ความเข้าใจในประเภทของเครื่องดื่ม รสชาติ และหลักการจับคู่รสชาติสากล เพื่อให้คำแนะนำที่ถูกต้องและตอบข้อซักถามของลูกค้าได้อย่างมั่นใจ การจัดการเรียนรู้นี้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model รวมถึงระบบห้องปฏิบัติการจำลอง เพื่อพัฒนาทักษะการคิดวิเคราะห์และการสื่อสารภาษาอังกฤษ	["ระบุประเภทคำศัพท์ภาษาอังกฤษเกี่ยวกับเครื่องดื่มและไวน์ชนิดต่างๆ ได้ถูกต้อง", "อธิบายหลักการเบื้องต้นในการจับคู่เครื่องดื่มกับอาหาร (Food and Beverage Pairing) ตามมาตรฐานสากลได้", "บอกโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการแนะนำและตอบคำถามเกี่ยวกับเครื่องดื่มได้"]	["ออกเสียงชื่อเครื่องดื่มและไวน์ยี่ห้อสากลได้อย่างถูกต้อง", "ใช้เทคโนโลยี AR + 3D Menu และ AI Scan ผ่าน web app FINE Model ในการสืบค้นข้อมูลรสชาติและลักษณะของเครื่องดื่มได้", "พูดเสนอแนะและโต้ตอบบทสนทนาภาษาอังกฤษในการจับคู่อาหารกับเครื่องดื่มผ่านระบบ AI ผ่าน web app FINE Model ได้"]	["ไหวพริบ และความช่างสังเกตความต้องการของลูกค้า (Responsiveness)", "ความเชื่อมั่นในตนเองและมีบุคลิกภาพของผู้นำเสนอขาย (Professional Presence)", "ความรับผิดชอบและกระตือรือร้นในการปฏิบัติงานร่วมกับผู้อื่น"]	["เลือกและแนะนำเครื่องดื่มที่ช่วยชูรสชาติอาหารตามที่ลูกค้าสั่งได้อย่างเหมาะสม", "ประยุกต์ใช้ทักษะภาษาอังกฤษเพื่อตอบคำถามและข้อสงสัยของลูกค้าเกี่ยวกับเครื่องดื่มในสถานการณ์จำลองหน้างานได้", "ปรับเปลี่ยนกลยุทธ์การนำเสนอขายเครื่องดื่ม (Upselling) ได้เหมาะสมตามลักษณะและพฤติกรรมของลูกค้า"]	["Red wine", "White wine", "Sparkling wine", "Champagne", "Rosé wine", "Full-bodied", "Light-bodied", "Dry", "Sweet", "Fruity", "Crisp", "Acidic", "Pair with", "Go well with", "Complement", "Recommend", "Enhance"]	["For the main course, I would highly recommend a glass of Cabernet Sauvignon.", "This white wine pairs perfectly with seafood as it has a crisp and acidic taste.", "If you prefer something sweet, this dessert wine will complement your cake.", "To answer your question, this beverage is completely non-alcoholic."]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูจัดกิจกรรมทายภาพ "Perfect Match Game" โดยขึ้นภาพเมนูอาหาร เช่น Steak หรือ Seafood แล้วให้ผู้เรียนร่วมกันทายว่าเครื่องดื่มประเภทใด (เช่น ไวน์แดง ไวน์ขาว หรือน้ำโซดา) ที่ควรจะนำไปวางคู่กันบนโต๊ะอาหาร\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามปลายเปิดเพื่อกระตุ้นกระบวนการคิด:\n   - "ถ้านักเรียนสั่งสเต็กเนื้อวัวรสชาติเข้มข้น แต่พนักงานนำไวน์ขาวรสหวานมาเสิร์ฟให้ นักเรียนจะรู้สึกอย่างไร?"\n   - "ในฐานะพนักงานบริการ เราจะมีวิธีพูดแนะนำเครื่องดื่มอย่างไรให้ดูสุภาพ น่าเชื่อถือ และไม่ทำให้ลูกค้ารู้สึกอึดอัด?"\n3. ผู้เรียนร่วมกันแสดงความคิดเห็น ครูสรุปประเด็นและเชื่อมโยงเข้าสู่เป้าหมายการเรียนรู้วิธีการแนะนำเครื่องดื่ม	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)\n1. ครูแจก Worksheet ประจำสัปดาห์เรื่อง "The Beverage Sommelier"\n2. ผู้เรียนใช้เครื่องมือสมาร์ตโฟนสแกน AR + 3D Menu เพื่อดูโมเดล 3 มิติของขวดเครื่องดื่มและแก้วไวน์ประเภทต่างๆ\n3. ผู้เรียนทำภารกิจ AI Scan Learning web app FINE Model โดยการนำกล้องไปสแกนป้ายฉลากเครื่องดื่มจำลองหรือเมนูเครื่องดื่ม เพื่อระบุคีย์เวิร์ดภาษาอังกฤษ รสชาติ และประวัติย่อของเครื่องดื่มนั้นๆ\n4. ผู้เรียนจดบันทึกรายละเอียดของรสชาติเครื่องดื่มและคำศัพท์เฉพาะลงใน AI Scan Learning Record ผ่าน web app FINE Model เพื่อสร้างคลังความรู้ส่วนบุคคล	การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)\n1. ครูให้ผู้เรียนเปิดใช้งานระบบแอปพลิเคชัน ผ่าน web app FINE Model\n2. ผู้เรียนตั้งค่าโหมดคำสั่งผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่มีความจุกจิกและชอบถามคำถามเชิงลึกเกี่ยวกับเครื่องดื่ม เช่น "What kind of wine goes well with this spicy pasta?" หรือ "Is this drink too sweet?"\n3. ผู้เรียนฝึกสนทนาโต้ตอบด้วยเสียงจริงผ่าน web app FINE Model โดยพยายามพูดประโยคแนะนำ แนะนำรสชาติ และเสนอทางเลือกการจับคู่อาหารให้แก่ AI ผ่าน web app FINE Model\n4. ผู้เรียนรับคำแนะนำเชิงสะท้อนกลับ (Feedback) จากระบบ AI ผ่าน web app FINE Model ด้านการใช้คำศัพท์ที่สละสลวย การจัดลำดับคำพูด และความถูกต้องของการออกเสียงชื่อเฉพาะ เพื่อนำมาปรับใช้	การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน Restaurant Simulation (55 นาที)\n1. ครูนำผู้เรียนเข้าสู่พื้นที่ Restaurant Simulation (ห้องปฏิบัติการจำลอง) และรวมกลุ่มกลุ่มละ 4-5 คน\n2. แต่ละกลุ่มจะได้รับ "การ์ดคำสั่งภารกิจแนะนำเครื่องดื่ม" ซึ่งเป็นสถานการณ์สมมติหน้างาน เช่น "ลูกค้าสั่งอาหารประเภทปลาหิมะอบ และต้องการให้พนักงานเสนอไวน์ที่เข้ากัน 1 แก้ว" หรือ "ลูกค้าไม่ดื่มแอลกอฮอล์ พนักงานต้องนำเสนอเครื่องดื่มม็อกเทลที่มีความสดชื่นแทน"\n3. ผู้เรียนในกลุ่มร่วมกันฝึกฝน แบ่งหน้าที่เป็นพนักงานบริการและลูกค้า ฝึกฝนท่วงท่าการเดินไปที่โต๊ะ การผายมือชี้เมนูเครื่องดื่ม และการใช้น้ำเสียงโน้มน้าวใจ (Upselling Technique) อย่างสุภาพ	การลงมือปฏิบัติจริง (35 นาที)\n1. ตัวแทนแต่ละกลุ่มออกมาแสดงบทบาทสมมติในการแนะนำเครื่องดื่มและการตอบคำถามลูกค้าหน้าโต๊ะอาหารจำลองแบบสถานการณ์สด โดยไม่มีการดูเอกสาร\n2. ครูประเมินสมรรถนะผู้เรียนรายบุคคลและรายกลุ่มผ่านเกณฑ์การประเมิน (Rubric Score)\n3. ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ประจำสัปดาห์ (Post-test Quiz) ผ่าน web app FINE Model เพื่อวัดระดับความรู้เรื่องการจับคู่อาหารและเครื่องดื่ม	ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)\n1. Reflection: ครูและผู้เรียนสรุปหลักการร่วมกัน: การแนะนำเครื่องดื่มคือการช่วยให้มื้ออาหารของลูกค้าสมบูรณ์แบบยิ่งขึ้น, การเข้าใจรสชาติช่วยให้เราตอบคำถามได้อย่างมั่นใจ, และการฝึกพูดสม่ำเสมอผ่าน web app FINE Model ช่วยขจัดความกลัวในการคุยกับชาวต่างชาติ\n2. ผู้เรียนเขียนกิจกรรม Exit Ticket: ระบุชื่ออาหาร 1 จาน และเครื่องดื่มที่แนะนำให้จับคู่กัน 1 ชนิด พร้อมเขียนประโยคแนะนำภาษาอังกฤษ 1 ประโยค ส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:03:34.302724+07	2026-09-16 18:03:34.302724+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:03:34.302724+07	published
lesson-plan-week-9	แผนการจัดการเรียนรู้ สัปดาห์ที่ 9: Taking Food Orders (5.1 Taking Orders Pattern: รูปประโยคการรับออเดอร์ คำถาม และคำตอบที่ใช้บ่อย)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 9	การรับคำสั่งอาหารและเครื่องดื่ม (Taking Food and Beverage Orders) ถือเป็นขั้นตอนหัวใจสำคัญในการบริการของห้องอาหาร พนักงานบริการจำเป็นต้องมีความเชี่ยวชาญในการใช้รูปประโยคภาษาอังกฤษที่เป็นมาตรฐานสากล สุภาพ และถูกต้องตามหลักการบริการ รวมถึงสามารถใช้คำถามเจาะลึกเพื่อตรวจสอบความต้องการที่ถูกต้องของลูกค้า เช่น ระดับความสุกของเนื้อ หรือประเภทของเครื่องเคียง การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยีปัญญาประดิษฐ์ผ่าน web app FINE Model ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อเสริมสร้างความมั่นใจและความแม่นยำในการสื่อสารภาษาอังกฤษในวิชาชีพการโรงแรม	["บอกรูปประโยคและสำนวนภาษาอังกฤษในการแนะนำตัวและเริ่มต้นรับออเดอร์ได้อย่างถูกต้อง", "ระบุคำถามที่ใช้บ่อยในการถามรายละเอียดอาหาร เช่น ความสุกของสเต็ก น้ำสลัด หรือเครื่องเคียงได้", "เข้าใจโครงสร้างประโยคในการจดบันทึกและทวนรายการอาหารเพื่อป้องกันความผิดพลาด"]	["ออกเสียงคำศัพท์และประโยคในการรับออเดอร์ได้อย่างถูกต้อง", "ใช้เทคโนโลยีผ่าน web app FINE Model ในการฝึกฝนบทสนทนารับออเดอร์โต้ตอบได้", "ปฏิบัติหน้าที่จดบันทึกออเดอร์ด้วยสัญลักษณ์ย่อสากลในสถานการณ์จำลอง (Simulation) ได้"]	["ความเอาใจใส่และความอดทนในการฟังความต้องการของลูกค้า (Active Listening)", "บุคลิกภาพที่สุภาพ และยิ้มแย้มแจ่มใส", "เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม"]	["เลือกใช้รูปประโยคการรับออเดอร์ที่เหมาะสมกับประเภทและบรรยากาศของห้องอาหารได้", "ประยุกต์ใช้ความรู้ในการแก้ปัญหาเมื่อลูกค้าถามคำถามเกี่ยวกับรายละเอียดของอาหารในเมนูได้", "นำทักษะการฟังและการถามคำถามไปปรับใช้กับการรับออเดอร์ในสถานการณ์จริงได้อย่างเป็นมืออาชีพ"]	["Order Taking", "Order Pad", "Steak Doneness", "Rare", "Medium Rare", "Medium", "Medium Well", "Well Done", "Salad Dressing", "Side Dish", "Active Listening", "Repeating Order"]	["Are you ready to order now, sir/madam?", "May I take your order, please?", "Would you care for any appetizers to start with?", "How would you like your steak cooked?", "What kind of dressing would you prefer for your salad?", "Certainly, sir. One Ribeye steak, medium rare."]	ขั้นนำเข้าสู่บทเรียน (20 นาที)\n1. ครูเปิดคลิปวิดีโอสั้นจำลองสถานการณ์การรับออเดอร์ในห้องอาหารเพื่อกระตุ้นการเรียนรู้ เพื่อให้ผู้เรียนเปรียบเทียบพฤติกรรมการรับออเดอร์ของพนักงานสองแบบ\n2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูตั้งคำถามเพื่อเชื่อมโยงและกระตุ้นความเห็นของผู้เรียน:\n   - "จากวิดีโอ พนักงานคนแรกทำพลาดในจุดไหนบ้างในขณะรับออเดอร์?"\n   - "ถ้าลูกค้าสั่งสเต็กแล้วเราลืมถามระดับความสุก จะส่งผลเสียต่อห้องอาหารและห้องครัวอย่างไร?"\n3. ผู้เรียนร่วมกันอภิปรายอย่างอิสระ ครูสรุปเชื่อมโยงเข้าสู่วัตถุประสงค์ของการเรียนรูปประโยคการรับออเดอร์มาตรฐาน	ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)\n1. ครูแจก Worksheet "The Perfect Order Taking Sheet" ให้แก่ผู้เรียนทุกคน\n2. ผู้เรียนใช้แท็บเล็ตหรือสมาร์ตโฟนเปิดระบบคลังข้อมูลสากลเพื่อศึกษาโครงสร้างประโยค "Taking Orders Pattern" ที่ครูเตรียมไว้\n3. ภารกิจกลุ่มย่อย: ผู้เรียนร่วมกันจำแนกประโยคภาษาอังกฤษออกเป็น 4 หมวดหลัก ได้แก่ 1) ประโยคเปิดการรับออเดอร์ 2) ประโยคถามรายละเอียด/เครื่องเคียง 3) ประโยคแนะนำเพิ่มเติม และ 4) ประโยคปิดท้าย/ขอบคุณ พร้อมฝึกออกเสียงประโยคเหล่านั้นร่วมกันในกลุ่ม\n4. ผู้เรียนสรุปรูปประโยคที่สำคัญลงในใบงานของตนเอง	การปฏิสัมพันธ์และฝึกฝนระบบภาษากับ AI Support ผ่าน web app FINE Model (50 นาที)\n1. ครูมอบหมายภารกิจเดี่ยวให้ผู้เรียนใช้แอปพลิเคชันผ่าน web app FINE Model บนสมาร์ตโฟน\n2. ผู้เรียนป้อนคำสั่ง (Prompt) ให้ระบบผ่าน web app FINE Model สวมบทบาทเป็นชาวต่างชาติที่เข้ามานั่งทานอาหารในร้าน และพร้อมที่จะสั่งอาหาร โดยผู้เรียนต้องทำหน้าที่เป็นพนักงานบริการที่คอยซักถามข้อมูล\n3. ผู้เรียนใช้ฟังก์ชันผ่าน web app FINE Model เพื่อสนทนาโต้ตอบผ่านเสียงจริง โดยฝึกใช้รูปประโยค เช่น "How would you like your steak?" หรือ "Would you prefer fries or mashed potatoes?"\n4. ระบบ AI ผ่าน web app FINE Model จะทำการจับเสียงและให้ข้อเสนอแนะ (Feedback) เรื่องการเน้นเสียง (Intonation) และความถูกต้องของไวยากรณ์ ผู้เรียนทำการจดบันทึกสิ่งที่ค้นพบและคำศัพท์ใหม่ลงใน AI Learning Record	การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)\n1. ครูแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 3 คน (สลับบทบาทเป็น: พนักงานบริการ, ลูกค้าคนที่ 1, ลูกค้าคนที่ 2) เพื่อเข้าสู่กิจกรรม "The Order Taking Challenge" ในพื้นที่ห้องปฏิบัติการจำลอง (Restaurant Simulation)\n2. ครูแจกการ์ดบทบาทสมมติ (Role-play Cards) ที่มีความท้าทายต่างกัน เช่น "ลูกค้าที่ทานมังสวิรัติและต้องการเปลี่ยนเครื่องเคียงทั้งหมด" หรือ "ลูกค้าที่ต้องการสั่งอาหารชุดใหญ่แต่เลือกน้ำสลัดไม่ถูก"\n3. ผู้เรียนที่เป็นพนักงานบริการต้องใช้ทักษะการฟังอย่างมีสติ นำรูปประโยคที่ฝึกฝนมาใช้ซักถาม จดบันทึกออเดอร์ลงในสมุด Order Pad โดยใช้รหัสย่อสากลให้ถูกต้องตามเวลาที่กำหนด\n4. ครูเดินสังเกตการณ์ คอยให้คำแนะนำและปรับท่วงท่าการยืน การถือแผ่นจดออเดอร์ให้เหมาะสม	การลงมือปฏิบัติจริง (35 นาที)\n1. แต่ละกลุ่มส่งตัวแทนออกมาสาธิตการรับออเดอร์ภาษาอังกฤษแบบสดต่อหน้าชั้นเรียน โดยครูจะทำการสุ่มเพิ่มเงื่อนไขหน้างานเพื่อทดสอบไหวพริบ\n2. ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่มและรายบุคคลด้วยเกณฑ์คะแนน Rubrics\n3. ผู้เรียนทุกคนทำแบบทดสอบความรู้รายบุคคล (Quiz) เกี่ยวกับสำนวนภาษาอังกฤษคำถาม-คำตอบที่ใช้บ่อยผ่านระบบออนไลน์	ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)\n1. Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: ความสำคัญของการทวนออเดอร์, ความสุภาพในการซักถามรายละเอียดอาหาร, และความมั่นใจที่เพิ่มขึ้นจากการฝึกฝนร่วมกับผ่าน web app FINE Model\n2. ผู้เรียนทำกิจกรรม Exit Ticket: เขียนประโยคคำถามในการรับออเดอร์ที่คิดว่าสละสลวยและมั่นใจที่สุดมาคนละ 3 ประโยคลงในกระดาษโน้ตส่งครูก่อนออกจากห้องเรียน	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:05:59.816356+07	2026-09-16 18:05:59.816356+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:05:59.816356+07	published
lesson-plan-week-10	แผนการจัดการเรียนรู้ สัปดาห์ที่ 10: Taking Food Orders (5.2 Order Taking Simulation: การจำลองการรับออเดอร์ ณ โต๊ะอาหาร และการรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพัก)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 10	การจำลองการรับออเดอร์ (Order Taking Simulation) เป็นทักษะขั้นสูงที่เชื่อมโยงความรู้ทางภาษาเข้ากับการปฏิบัติงานจริงในงานโรงแรม ผู้เรียนจะต้องฝึกฝนทั้งการรับออเดอร์ ณ โต๊ะอาหาร (Restaurant Order) แบบเผชิญหน้า และการรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพัก (Room Service Order) ซึ่งต้องอาศัยทักษะการฟังและการสื่อสารที่ชัดเจนโดยไม่มีโอกาสเห็นหน้าลูกค้า การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model รวมถึงการจำลองสถานการณ์เสมือนจริง เพื่อสร้างสมรรถนะการบริการที่เป็นไปตามมาตรฐานสากล	["อธิบายขั้นตอนและโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการรับออเดอร์ ณ โต๊ะอาหารได้ถูกต้อง", "อธิบายความแตกต่างและขั้นตอนเฉพาะของการรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพักได้", "ระบุความหมายของรหัสย่อและระบบบันทึกคำสั่งซื้อของห้องอาหารตามมาตรฐานโรงแรมได้"]	["พูดสื่อสารและโต้ตอบภาษาอังกฤษในบริบทการรับออเดอร์ทั้งแบบต่อหน้าและทางโทรศัพท์ได้อย่างถูกต้อง", "ใช้เทคโนโลยีผ่าน web app FINE Model ในการจำลองบทบาทสมมติเพื่อรับออเดอร์ได้", "ปฏิบัติทักษะการจดออเดอร์และการประสานงานในห้องปฏิบัติการจำลองได้"]	["น้ำเสียง และภาษาที่สุภาพ (Telephone Courtesy & Hospitality)", "สมาธิและความอดทนในการฟังความต้องการของลูกค้าโดยไม่ขัดจังหวะ", "เจตคติที่ดีและมีความสุขในการแก้ไขปัญหาให้ลูกค้าในสถานการณ์จริง"]	["ปรับเปลี่ยนระดับภาษาและเทคนิคการขาย (Upselling) ให้เหมาะสมกับช่องทางการรับออเดอร์แต่ละแบบได้", "ควบคุมสถานการณ์และแก้ไขข้อขัดข้องเบื้องต้นในขณะรับออเดอร์ทางโทรศัพท์ได้", "นำทักษะการบันทึกออเดอร์ไปส่งต่อข้อมูลให้แก่แผนกครัวได้อย่างถูกต้อง"]	[{"word": "Restaurant Order", "meaning": "การรับออเดอร์ ณ โต๊ะอาหาร"}, {"word": "Room Service Order", "meaning": "การรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพัก"}, {"word": "Telephone Courtesy", "meaning": "มารยาทและมาตรฐานการสื่อสารทางโทรศัพท์"}, {"word": "Upselling", "meaning": "เทคนิคการเชียร์ขายหรือแนะนำเมนูเพิ่มเติม"}, {"word": "Flowchart", "meaning": "ผังลำดับขั้นตอนการปฏิบัติงานรับออเดอร์"}, {"word": "Spaghetti Carbonara", "meaning": "สปาเกตตีคาโบนารา"}, {"word": "Extra cheese", "meaning": "เพิ่มชีสพิเศษ"}, {"word": "Hold the onions", "meaning": "ไม่ใส่หัวหอม / ละเว้นหัวหอม"}, {"word": "Order Form", "meaning": "ใบจดบันทึกคำสั่งซื้ออาหาร"}, {"word": "Double Check", "meaning": "การทบทวนตรวจสอบความถูกต้องของรายการอาหาร"}, {"word": "Chef's Special", "meaning": "เมนูอาหารพิเศษประจำวันของเชฟ"}, {"word": "Room Number", "meaning": "หมายเลขห้องพักของผู้รับบริการ"}]	["Good evening, may I take your order now, please?", "May I recommend our chef's special, the Grilled Salmon?", "Room Service, this is [Name] speaking. How may I assist you today, sir/madam?", "May I have your room number and your name, please?", "Could you please repeat that for me, sir?", "Let me double check your order."]	["ครูจัดกิจกรรมทายเสียงจำลอง โดยเปิดไฟล์เสียงเฉพาะบทสนทนาการโทรสั่งอาหารแบบ Room Service ที่มีทั้งเสียงรบกวนและข้อผิดพลาด", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อให้ผู้เรียนร่วมกันวิเคราะห์: 'การรับออเดอร์ทางโทรศัพท์ยากกว่าการรับออเดอร์ที่โต๊ะอาหารอย่างไรบ้าง?' และ 'พนักงานควรทำอย่างไรเมื่อลูกค้าในสายพูดเร็วเกินไปหรือสัญญาณโทรศัพท์ไม่ชัดเจน?'", "ผู้เรียนแลกเปลี่ยนความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่บทเรียนเรื่องการฝึกจำลองสถานการณ์จริง"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model กับกระบวนการจำลองออเดอร์สองรูปแบบ (60 นาที)", "ครูแจกเอกสารผังขั้นตอน (Flowchart) การรับออเดอร์ ณ โต๊ะอาหาร และการรับออเดอร์ Room Service พร้อมทั้งให้ผู้เรียนสแกน QR Code Learning Access เพื่อเข้าถึงหน้า Flowchart Interactive บนอุปกรณ์ส่วนตัว ช่วยให้เห็นการทำงานแบบเป็นลำดับขั้นชัดเจนยิ่งขึ้น", "ผู้เรียนแบ่งกลุ่มศึกษาคำศัพท์เฉพาะและสำนวนภาษาอังกฤษที่จำเป็น เช่น 'Spaghetti Carbonara', 'Extra cheese', 'Hold the onions' รวมทั้งสัญลักษณ์ย่อที่ใช้เขียนกำกับลงในใบงาน", "ผู้เรียนทดลองจับคู่ซ้อมอ่านบทสนทนาตามผังเพื่อทำความเข้าใจลำดับก่อน-หลังของการบริการ"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ผู้เรียนใช้สมาร์ตโฟนหรือแท็บเล็ตเข้าใช้งานแอปพลิเคชัน Gemini และ Gemini Live ผ่าน web app FINE Model", "ภารกิจที่ 1 (Restaurant Mode): ผู้เรียนพิมพ์คำสั่งให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่นั่งอยู่ที่โต๊ะอาหาร จากนั้นใช้ฟังก์ชัน Gemini Live ผ่าน web app FINE Model พูดคุยแนะนำเมนูและรับออเดอร์อาหารหลัก พร้อมเครื่องเคียง", "ภารกิจที่ 2 (Room Service Mode): ผู้เรียนตั้งโจทย์ให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นแขกที่พักห้อง 405 และโทรศัพท์มาสั่งอาหารเช้า โดยผู้เรียนต้องหลับตาหรือหันหลังให้หน้าจอเพื่อฝึกทักษะการฟังจากเสียงอย่างเดียวผ่าน Gemini Live ผ่าน web app FINE Model", "ผู้เรียนจดบันทึกคำศัพท์เด่นและข้อผิดพลาดที่ AI แนะนำลงใน AI Learning Record ผ่าน web app FINE Model เพื่อนำมาปรับปรุงระบบการออกเสียงของตนเอง"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง (55 นาที)", "ครูจัดพื้นที่ห้องปฏิบัติการออกเป็น 2 โซนหลัก: โซนโต๊ะอาหารห้องอาหารจำลอง (Restaurant Simulation) และโซนเคาน์เตอร์โทรศัพท์บริการห้องพัก (Room Service Station)", "ผู้เรียนในแต่ละกลุ่มสลับบทบาทกันเข้าสถานีทดสอบ: 1) สถานีที่ 1 (Restaurant): ฝึกการเดินเข้าไปรับออเดอร์ จัดท่าทางการยืน และเชียร์ขายอาหารจานเคียงเป็นภาษาอังกฤษ 2) สถานีที่ 2 (Room Service): ฝึกการใช้อุปกรณ์โทรศัพท์จำลอง รับสายภายใน 3 ครั้งตามมาตรฐานสากล จดรายละเอียดชื่อแขก หมายเลขห้อง และรายการอาหารลงในใบสั่งซื้อด่วน", "ครูสอดแทรกสถานการณ์ท้าทาย เช่น ลูกค้าขอเปลี่ยนส่วนผสมของอาหารกะทันหัน เพื่อให้ผู้เรียนใช้ไหวพริบปฏิภาณในการตอบโต้"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)", "สุ่มตัวแทนกลุ่มออกมาปฏิบัติการรับออเดอร์สดในแต่ละโซน โดยครูและเพื่อนร่วมชั้นร่วมกันสังเกตการณ์", "ครูประเมินผลการปฏิบัติงานรายบุคคลและรายกลุ่มผ่านเกณฑ์คะแนนแบบ Rubrics", "ผู้เรียนทุกคนทำแบบทดสอบควิซออนไลน์ผ่าน web app FINE Model รายบุคคลเพื่อทบทวนประโยคและคำถามสำคัญที่พนักงานบริการ"]	["Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียนร่วมกันชี้ให้เห็นความสำคัญของการใช้น้ำเสียง (Tone of Voice) ในการคุยโทรศัพท์ และการสบตาในการรับออเดอร์หน้าโต๊ะ", "ผู้เรียนส่งใบประเมิน Exit Ticket: ระบุ 1 สิ่งที่ตนเองคิดว่าต้องปรับปรุงในการฟังภาษาอังกฤษ และ 1 ประโยคเด็ดที่ใช้ Upselling ได้สำเร็จส่งครูก่อนเลิกคาบ"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:09:48.655052+07	2026-09-16 18:09:48.655052+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:09:48.655052+07	published
lesson-plan-week-11	แผนการจัดการเรียนรู้ สัปดาห์ที่ 11: Taking Food Orders (5.3 Confirming Orders: การตรวจสอบรายการอาหารและเครื่องดื่ม และการทวนสอบยืนยันความถูกต้องตามมาตรฐาน)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 11	การตรวจสอบและยืนยันความถูกต้องของรายการสั่งซื้อ (Confirming Orders) เป็นขั้นตอนสุดท้ายที่มีความสำคัญในกระบวนการรับออเดอร์เพื่อป้องกันข้อผิดพลาดในการสื่อสาร ลดความสูญเสียของวัตถุดิบอาหาร และสร้างความพึงพอใจให้แก่ลูกค้า พนักงานบริการจำเป็นต้องมีความรู้ในรูปประโยคภาษาอังกฤษที่เป็นแบบแผนสำหรับการทวนออเดอร์ การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาทักษะการฟัง การบันทึก และการยืนยันข้อมูลอย่างถูกต้อง	["อธิบายหลักการ ลำดับขั้นตอน และความสำคัญของการทวนรายการอาหารและเครื่องดื่มได้", "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการทวนออเดอร์ และการแจ้งระยะเวลาในการรออาหารได้อย่างถูกต้อง", "อธิบายสัญลักษณ์และเครื่องหมายมาตรฐานที่ใช้ในการตรวจสอบความถูกต้องบนใบสั่งอาหารได้"]	["ทวนรายการอาหารและเครื่องดื่มเป็นภาษาอังกฤษได้และถูกต้อง", "ใช้เทคโนโลยีผ่าน web app FINE Model ในการจำลองบทบาทสมมติเพื่อทวนและตรวจสอบออเดอร์ได้", "บันทึก ปรับปรุง และยืนยันความถูกต้องของข้อมูลออเดอร์ในสถานการณ์จำลองได้"]	["ความรอบคอบและความใส่ใจในรายละเอียดคำสั่งซื้อของลูกค้า (Attention to Detail)", "ความสุภาพ ให้ข้อมูลชัดเจน และความมั่นใจในการสื่อสาร (Professional Courtesy)", "เจตคติที่ดีต่อการรับฟัง และการแก้ไขข้อผิดพลาดในการบริการ"]	["ประยุกต์ใช้ทักษะการทวนออเดอร์เพื่อแก้ไขสถานการณ์เมื่อลูกค้าขอเปลี่ยนแปลงหรือยกเลิกบางรายการได้", "ตรวจสอบความถูกต้องของใบสั่งอาหารก่อนส่งต่อเข้าสู่ระบบส่วนครัวได้", "บูรณาการทักษะภาษาเพื่อทวนออเดอร์ให้ถูกต้องตามหลัก Zero-Waste Communication ก่อนส่งเข้าแผนกครัว"]	[{"word": "Confirming Orders", "meaning": "การตรวจสอบและยืนยันความถูกต้องของรายการสั่งอาหาร"}, {"word": "Order Slip", "meaning": "ใบสั่งอาหาร / สลิปรายการอาหาร"}, {"word": "Captain Order Pad", "meaning": "สมุดจดบันทึกคำสั่งซื้อของหัวหน้าพนักงานบริการ"}, {"word": "Dressing on the side", "meaning": "แยกน้ำสลัดใส่ถ้วยต่างหาก ไม่ราดบนผัก"}, {"word": "No MSG", "meaning": "ไม่ใส่ผงชูรส"}, {"word": "Well done", "meaning": "เนื้อสุกทั่วกันทั้งชิ้น"}, {"word": "Appetizer", "meaning": "อาหารเรียกน้ำย่อย"}, {"word": "Main Course", "meaning": "อาหารจานหลัก"}, {"word": "Dessert", "meaning": "ของหวาน"}, {"word": "Beverage", "meaning": "เครื่องดื่ม"}, {"word": "Outside-In", "meaning": "ลำดับการบริการและการทวนสอบตามขั้นตอนเสิร์ฟสากล"}, {"word": "Double-check", "meaning": "การทวนสอบซ้ำสองครั้งเพื่อความแม่นยำ"}]	["May I repeat your order, please?", "Let me double-check your order, sir/madam.", "For the appetizers, you have one Caesar salad with dressing on the side.", "For the main course, we have one medium-rare Ribeye steak, and one Spaghetti Carbonara.", "Is there anything else I can get for you?", "Your order will be ready in about 15 to 20 minutes. Thank you very much."]	["ครูเปิดคลิปเสียงสั้นจำลองเหตุการณ์พนักงานเสิร์ฟส่งอาหารผิดโต๊ะเนื่องจากจดออเดอร์ผิดพลาดและไม่มีการทวนออเดอร์ เพื่อให้ผู้เรียนเห็นผลกระทบที่เกิดขึ้น", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อชวนคิด: 'นักเรียนคิดว่าความเสียหายของการเสิร์ฟอาหารผิดพลาดส่งผลเสียต่อห้องอาหารอย่างไรบ้าง?' และ 'คำพูดหรือประโยคภาษาอังกฤษแบบไหนที่จะช่วยล้อมคอกไม่ให้เกิดการส่งออเดอร์ผิดพลาดได้?'", "ผู้เรียนร่วมกันอภิปราย ครูสรุปประเด็นและนำเข้าสู่บทเรียนเรื่องขั้นตอนในการยืนยันออเดอร์"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)", "ครูให้ผู้เรียนสแกน QR Code Learning Access บนอุปกรณ์ส่วนตัว เพื่อเข้าถึงหน้า Flowchart Interactive web app FINE Model เรื่องลำดับขั้นตอนการตรวจสอบและการทวนสอบออเดอร์ตามมาตรฐานโรงแรม", "ผู้เรียนศึกษาใบงานโครงสร้างประโยคภาษาอังกฤษสำหรับการทวนออเดอร์ (Confirming Sentences) รวมถึงเรียนรู้คำศัพท์เชิงเทคนิค เช่น 'Dressing on the side', 'No MSG', 'Well done'", "ผู้เรียนฝึกจับคู่จัดหมวดหมู่รายการอาหารในเมนูตัวอย่างลงใบงานตามลำดับการเสิร์ฟ (Appetizer -> Main Course -> Dessert -> Beverage) เพื่อสร้างความคุ้นเคยในการจัดระเบียบข้อมูล"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ผู้เรียนเปิดใช้งานแอปพลิเคชัน ผ่าน web app FINE Model บนสมาร์ตโฟน", "ภารกิจที่ 1 (Order Checking Mode): ผู้เรียนป้อน Prompt ให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่สั่งอาหารชุดใหญ่ที่มีเงื่อนไขพิเศษหลายข้อ จากนั้นผู้เรียนใช้ Gemini Live ผ่าน web app FINE Model พูดโต้ตอบเพื่อสรุปและทวนรายการอาหารเหล่านั้นเป็นภาษาอังกฤษให้ถูกต้อง", "ภารกิจที่ 2 (Order Modification Challenge): ป้อนคำสั่งให้ Gemini ผ่าน web app FINE Model แกล้งจำลองสถานการณ์เปลี่ยนใจกลางคันในขณะที่พนักงานกำลังทวนออเดอร์ (เช่น 'Actually, change the soup to salad, please.') ผู้เรียนต้องตั้งสติ ฟัง ปรับแก้ไขในใบบันทึก และพูดทวนสอบรอบสุดท้ายให้ถูกต้อง", "ผู้เรียนบันทึกคำศัพท์ สำนวน และข้อแนะนำเรื่องการออกเสียงที่ได้จากระบบลงใน AI Learning Record ผ่าน web app FINE Model"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)", "ครูจัดพื้นที่ห้องปฏิบัติการจำลอง (Restaurant Simulation) โดยแบ่งกลุ่มผู้เรียนเป็นทีมบริการและทีมลูกค้า", "ครูแจกการ์ดบทบาทสมมติ (Role-play Cards) ให้ฝั่งลูกค้า ซึ่งจะระบุรายการอาหารที่สั่งมีคำที่ซับซ้อน", "ฝั่งพนักงานบริการต้องเข้ามารับออเดอร์ บันทึกข้อมูลอย่างรวดเร็ว และใช้ทักษะการทวนออเดอร์ตามแบบแผน Outside-In ตามลำดับการเสิร์ฟอาหารแต่ละประเภท พร้อมทั้งสรุปเงื่อนไขพิเศษได้", "ครูสอดแทรกอุปสรรคหน้างาน เช่น ลูกค้าแกล้งทักท้วงว่ารายการที่พนักงานทวนนั้นไม่ตรงกับที่สั่ง เพื่อทดสอบทักษะการแก้ปัญหาเฉพาะหน้าและการใช้คำพูดที่สุภาพ"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)", "สุ่มตัวแทนกลุ่มออกมาสาธิตการปฏิบัติงานรับออเดอร์และทวนออเดอร์หน้าชั้นเรียน โดยเน้นย้ำความถูกต้องของภาษา การออกเสียง น้ำเสียง และการแจ้งเวลาการรออาหาร", "ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อวัดความรู้ความเข้าใจเกี่ยวกับประโยคมาตรฐานในการทวนออเดอร์", "ครูประเมินสมรรถนะรายบุคคลและรายกลุ่มผ่านเกณฑ์ Rubrics"]	["Reflection: ครูและผู้เรียนร่วมกันสะท้อนผลการทำกิจกรรม โดยชี้ให้เห็นว่าการทวนออเดอร์ไม่ใช่แค่การทวนคำพูด แต่คือการแสดงความใส่ใจในทุกรายละเอียดของลูกค้า", "ผู้เรียนเขียน Exit Ticket ระบุ 3 ประโยคสำคัญที่ต้องใช้ทุกครั้งในการทวนออเดอร์ และ 1 ประสบการณ์ที่ได้เรียนรู้จากการฝึกร่วมกับ Gemini Live ผ่าน web app FINE Model ส่งครูก่อนจบคาบเรียน"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:12:27.627677+07	2026-09-16 18:12:27.627677+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:12:27.627677+07	published
lesson-plan-week-12	แผนการจัดการเรียนรู้ สัปดาห์ที่ 12: Handling Special Requests (6.1 Handling Special Requests: การจัดการคำขอพิเศษเกี่ยวกับอาหารและการบริการ)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 12	การจัดการคำขอพิเศษของลูกค้า (Handling Special Requests) ทั้งในด้านอาหารและการบริการ ถือเป็นองค์ประกอบสำคัญในการส่งมอบการบริการที่เหนือความคาดหมาย และเป็นไปตามมาตรฐานการปฏิบัติงานของโรงแรมระดับสากล พนักงานบริการต้องมีความรู้ในหลักการจัดการคำขอ รูปประโยคสำนวนภาษาอังกฤษในการตอบรับหรือปฏิเสธอย่างสุภาพ ตลอดจนการประสานงานร่วมกับฝ่ายที่เกี่ยวข้อง การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยีการสแกนด้วยปัญญาประดิษฐ์ (AI Scan) ระบบคิดวิเคราะห์และโต้ตอบอัจฉริยะ (Gemini และ Gemini Live) ควบคู่กับการจำลองสถานการณ์ (Simulation-Based Learning) ผ่าน web app FINE Model เพื่อเสริมสร้างสมรรถนะการแก้ไขปัญหาเฉพาะหน้าและการสื่อสารอย่างมืออาชีพ	["อธิบายประเภทและหลักการจัดการคำขอพิเศษเกี่ยวกับอาหารและการบริการตามมาตรฐานวิชาชีพโรงแรมได้", "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการตอบรับ ปฏิเสธ หรือขอตรวจสอบคำขอพิเศษได้อย่างถูกต้อง", "อธิบายขั้นตอนการประสานงานระหว่างแผนกบริการและแผนกครัวเมื่อได้รับคำขอพิเศษจากลูกค้าได้"]	["สื่อสารภาษาอังกฤษโต้ตอบเพื่อจัดการคำขอพิเศษของลูกค้าได้อย่างถูกต้อง", "ใช้เทคโนโลยีผ่าน web app FINE Model ในการสืบค้นข้อมูลและฝึกปฏิบัติจำลองบทบาทสมมติได้", "บันทึกคำขอพิเศษลงในระบบจดออเดอร์และส่งต่อข้อมูลในสถานการณ์จำลองได้"]	["จิตบริการและความยืดหยุ่นในการปฏิบัติงานเพื่อตอบสนองความต้องการของลูกค้า (Service Mind & Flexibility)", "ความรอบคอบและใส่ใจรายละเอียดส่วนบุคคลของลูกค้า", "ความมั่นใจและความมีสติในการแก้ไขปัญหาเฉพาะหน้า"]	["ประยุกต์ใช้ทักษะการเจรจาและสำนวนบริการภาษาอังกฤษในการเสนอทางเลือกอื่นเมื่อไม่สามารถตอบรับคำขอของลูกค้าได้", "บูรณาการความรู้เรื่องคำขอพิเศษเพื่อจัดเตรียมอุปกรณ์หรือประสานงานหน้างานได้อย่างถูกต้องไร้ข้อผิดพลาด", "บูรณาการความรู้และไหวพริบในการควบคุมบทสนทนาเพื่อหาทางออกที่ดีที่สุดให้แก่ลูกค้า"]	[{"word": "Special Requests", "meaning": "คำขอพิเศษจากลูกค้าด้านอาหารและการบริการ"}, {"word": "Vegetarian", "meaning": "อาหารมังสวิรัติ (ละเว้นเนื้อสัตว์แต่ทานไข่/นมได้)"}, {"word": "Vegan", "meaning": "อาหารเจบริสุทธิ์ (ละเว้นเนื้อสัตว์และผลผลิตจากสัตว์ทั้งหมด)"}, {"word": "Gluten-free", "meaning": "อาหารที่ไม่มีกลูเตน (สำหรับผู้แพ้โปรตีนในข้าวสาลี)"}, {"word": "Low-sodium", "meaning": "อาหารที่มีปริมาณโซเดียมต่ำ / ลดเค็ม"}, {"word": "Dressing on the side", "meaning": "แยกน้ำสลัดใส่ถ้วยต่างหาก"}, {"word": "Extra cutlery", "meaning": "ขอชุดช้อนส้อมหรืออุปกรณ์รับประทานอาหารเพิ่ม"}, {"word": "Wheelchair accessible table", "meaning": "โต๊ะที่จัดไว้รองรับลูกค้ารถเข็นผู้พิการ"}, {"word": "High chair for a baby", "meaning": "เก้าอี้สูงสำหรับเด็กเล็ก"}, {"word": "Dietary Requirements", "meaning": "ข้อกำหนดหรือข้อจำกัดด้านโภชนาการและสุขภาพ"}, {"word": "Polite Refusal", "meaning": "การปฏิเสธคำขออย่างสุภาพและนุ่มนวล"}, {"word": "Alternative Suggestion", "meaning": "การนำเสนอทางเลือกหรือเมนูอื่นทดแทน"}]	["Certainly, sir/madam. We can definitely arrange that for you.", "No problem at all, I will inform the chef to prepare your dish with no added salt.", "Please allow me to check with the kitchen first.", "I am afraid we cannot substitute this ingredient, but may I suggest our delicious [Alternative Dish] instead?"]	["ครูจัดกิจกรรม 'ความต้องการที่แตกต่าง' โดยแจกกระดาษโน้ตสีให้ผู้เรียนสมมติตนเองเป็นแขกวีไอพีที่มีความต้องการแปลกๆ หรือเงื่อนไขในการทานอาหารที่จำกัดคนละ 1 ข้อ", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูเลือกโน้ตบางใบขึ้นมาอ่านแล้วถามผู้เรียนว่า: 'ถ้าเจอคำขอที่ยากหรือนอกเหนือจากเมนูแบบนี้ พนักงานเสิร์ฟควรทำอย่างไรระหว่างปฏิเสธทันทีกับตอบรับโดยการขาดการวิเคราะห์ก่อน?' และ 'คำพูดภาษาอังกฤษคำไหนที่จะช่วยให้ลูกค้ารู้สึกว่าเรากำลังพยายามช่วยเหลือเขาอย่างเต็มที่?'", "ผู้เรียนร่วมกันแสดงความคิดเห็น ครูเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้เรื่องการจัดการคำขอพิเศษ"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)", "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อเปิดระบบ Flowchart Interactive เรื่อง 'ขั้นตอนการรับและการจัดการคำขอพิเศษ (Special Request Protocol)'", "ผู้เรียนใช้ฟังก์ชัน AI Scan ผ่าน web app FINE Model สแกนดูรายการส่วนผสมบนแผ่นเมนูจำลอง เพื่อศึกษาคำศัพท์เฉพาะกลุ่มอาหารทางเลือก (Dietary Requirements) และตัวอย่างประโยคบริการ แล้วบันทึกข้อมูลที่พบลงใน AI Scan Learning Record", "ผู้เรียนจับคู่กันทำใบงานคัดแยกประเภทคำขอพิเศษ (Food vs Service Requests) และฝึกออกเสียงสำนวนภาษาอังกฤษในการตอบรับตามผังจำลอง"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model เพื่อฝึกทักษะทางการออกเสียง (50 นาที)", "ผู้เรียนเข้าใช้งานแอปพลิเคชัน ผ่าน web app FINE Model บนอุปกรณ์ดิจิทัลส่วนตัว", "ภารกิจที่ 1 (Dietary Request Mode): ผู้เรียนป้อน Prompt คำสั่งให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่ทานอาหารมังสวิรัติแบบเคร่งครัด (Vegan) และต้องการสั่งอาหารชุดเฉพาะ โดยผู้เรียนต้องใช้ระบบ Gemini Live ผ่าน web app FINE Model สนทนาโต้ตอบ แนะนำเมนูที่เหมาะสม และใช้คำตอบรับที่สุภาพ", "ภารกิจที่ 2 (Service Constraint Challenge): ตั้งโจทย์ให้ Gemini ผ่าน web app FINE Model แกล้งขอคำขอที่ห้องอาหารไม่สามารถให้ได้ (เช่น ขอนั่งโต๊ะริมหน้าต่างที่ถูกจองเต็มแล้ว) ผู้เรียนต้องฝึกฟังและใช้ฟังก์ชันเสียงผ่าน Gemini Live ผ่าน web app FINE Model พูดปฏิเสธอย่างสุภาพ และเสนอทางเลือกใหม่", "ผู้เรียนประเมินผลการออกเสียงของตนเองและจดบันทึกสำนวนเด็ดลงใน AI Learning Record ผ่าน web app FINE Model"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)", "ครูแบ่งพื้นที่ห้องปฏิบัติการจำลอง (Simulation Area) เป็นโต๊ะอาหารสถานการณ์ต่างๆ", "ผู้เรียนแบ่งกลุ่มเข้าประจำการ โดยครูแจกบทบาทสมมติ (Role-play Cards) ที่ซ่อนเงื่อนไขพิเศษท้าทาย เช่น 'ลูกค้าต้องการสเต็กที่ไม่มีเนยและน้ำมันเลยเนื่องจากปัญหาสุขภาพ' หรือ 'ลูกค้ามาพร้อมรถเข็นผู้พิการและต้องการย้ายโต๊ะด่วน'", "ผู้เรียนในกลุ่มต้องใช้ทักษะการฟัง ดึงสำนวนที่ฝึกกับ Gemini ผ่าน web app FINE Model มาใช้เจรจาต่อหน้า และบันทึกคำขอพิเศษลงในใบออเดอร์พร้อมทำสัญลักษณ์ส่งต่อข้อมูลให้แผนกครัวและทีมบริการได้อย่างถูกต้อง", "ครูคอยสังเกตการณ์ แจ้งปัญหาเพิ่ม และให้คำแนะนำด้านการแสดงออกทางบุคลิกภาพ"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)", "สุ่มตัวแทนกลุ่มออกมาปฏิบัติการรับมือกับคำขอพิเศษในสถานการณ์จำลองสดหน้าชั้นเรียน โดยเน้นความคล่องของภาษา (Fluency) และการแสดงมารยาทที่เหมาะสม", "ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อประเมินโครงสร้างประโยคและคำศัพท์เกี่ยวกับคำขอพิเศษ", "ครูประเมินสมรรถนะการปฏิบัติงานกลุ่มและรายบุคคลตามเกณฑ์ Rubrics"]	["Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: หัวใจของการจัดการคำขอพิเศษคือความยืดหยุ่นภายใต้ขอบเขตมาตรฐานและความปลอดภัยของแขก", "ผู้เรียนทำ Exit Ticket: พิมพ์ข้อความสรุปประโยคภาษาอังกฤษที่ดีที่สุดในการใช้แก้ไขสถานการณ์เมื่อเมนูไม่สามารถปรับเปลี่ยนได้ 1 ประโยค รวมกันก่อนสรุปก่อนสิ้นสุดกิจกรรม"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:16:25.209219+07	2026-09-16 18:16:25.209219+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:16:25.209219+07	published
lesson-plan-week-13	แผนการจัดการเรียนรู้ สัปดาห์ที่ 13: Handling Special Requests (6.2 Food Allergy and Menu Substitution: การจัดการเรื่องอาหารก่อภูมิแพ้และการเปลี่ยนเมนูอาหาร)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 13	การจัดการข้อจำกัดด้านการแพ้อาหาร และการเปลี่ยนเมนูอาหาร (Food Allergy and Menu Substitution) เป็นมาตรฐานความปลอดภัยขั้นสูง ในการบริการอาหารและเครื่องดื่มระดับสากล พนักงานบริการต้องมีความรู้เกี่ยวกับสารก่อภูมิแพ้หลัก (Major Food Allergens) มีความเข้าใจในกระบวนการเปลี่ยนทดแทนวัตถุดิบอย่างถูกต้อง และมีความเชี่ยวชาญในการใช้รูปประโยคภาษาอังกฤษในการซักถาม ยืนยัน หรือปฏิเสธกรณีที่มีความเสี่ยงต่อสุขภาพของลูกค้า การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model ในการจำลองสถานการณ์วิกฤตหน้างาน เพื่อสร้างสมรรถนะความรับผิดชอบต่อชีวิตผู้บริโภคและการสื่อสารอย่างเป็นมืออาชีพ	["ระบุประเภทของอาหารก่อภูมิแพ้หลัก (เช่น ถั่ว นม ไข่ อาหารทะเล แป้งสาลี) เป็นภาษาอังกฤษได้ถูกต้อง", "อธิบายขั้นตอนการบันทึกและการประสานงานเร่งด่วนเพื่อเปลี่ยนเมนูอาหารตามมาตรฐานความปลอดภัยได้", "ระบุโครงสร้างประโยคภาษาอังกฤษในการสอบถามอาการแพ้และการเสนอเมนูเปลี่ยนทดแทนได้อย่างถูกต้อง"]	["พูดซักถามและทวนอาการแพ้อาหารของลูกค้าเป็นภาษาอังกฤษได้อย่างถูกต้อง", "ใช้เทคโนโลยี AI Scan ในการตรวจสอบสารก่อภูมิแพ้บนเมนู และใช้ Gemini Live ผ่าน web app FINE Model ในการโต้ตอบสถานการณ์สับเปลี่ยนเมนู", "ปฏิบัติการบันทึกใบสั่งอาหาร และส่งต่อข้อมูลคำเตือนเรื่องอาการแพ้ไปยังห้องครัวได้อย่างถูกต้อง"]	["มีความตระหนักรู้และรับผิดชอบต่อความปลอดภัยในชีวิตของแขก (Safety Awareness)", "มีความละเอียดรอบคอบ ต่อข้อมูลการแพ้อาหารแม้เพียงเล็กน้อย (Extreme Attention to Detail)", "มีความสุภาพ มีสติ และแสดงความเห็นอกเห็นใจต่อข้อจำกัดของแขก (Empathy in Service)"]	["ประยุกต์ใช้ทักษะการวิเคราะห์ส่วนผสมเพื่อแนะนำเมนูทางเลือกอื่นที่ปลอดภัยให้แก่แขกได้ทันท่วงที", "แก้ไขสถานการณ์เฉพาะหน้าในห้องอาหารจำลองเมื่อลูกค้าแจ้งอาการแพ้อาหารกะทันหันได้อย่างถูกต้อง", "นำความรู้ไปปรับปรุงขั้นตอนการรับออเดอร์เพื่อความปลอดภัยของลูกค้าตั้งแต่ขั้นตอนแรก (Cross-contamination Prevention)"]	[{"word": "Food Allergy", "meaning": "การแพ้อาหาร"}, {"word": "Major Food Allergens", "meaning": "สารก่อภูมิแพ้หลักในอาหาร"}, {"word": "Menu Substitution", "meaning": "การเปลี่ยนส่วนผสมหรือเปลี่ยนเมนูทดแทน"}, {"word": "Peanut", "meaning": "ถั่วลิสง"}, {"word": "Dairy / Milk", "meaning": "ผลิตภัณฑ์จากนมวัว"}, {"word": "Egg", "meaning": "ไข่"}, {"word": "Seafood / Shellfish", "meaning": "อาหารทะเล / สัตว์น้ำมีเปลือก"}, {"word": "Wheat / Gluten", "meaning": "แป้งสาลี / กลูเตน"}, {"word": "Soy", "meaning": "ถั่วเหลือง"}, {"word": "Intolerance", "meaning": "ภาวะร่างกายย่อยยากหรือไม่ทนต่ออาหาร"}, {"word": "Severe reaction", "meaning": "อาการแพ้ขั้นรุนแรง"}, {"word": "Cross-contamination", "meaning": "การปนเปื้อนข้ามของสารก่อภูมิแพ้ในครัว"}]	["Do you have any food allergies or dietary restrictions that we should be aware of?", "Are you allergic to any specific ingredients?", "We can substitute the shrimp with chicken for your Pad Thai. Would that be acceptable?", "I will double-check with the chef to ensure this dish is 100% dairy-free for you."]	["ครูยกกรณีศึกษา (Case Study) ของสถานการณ์ห้องอาหารที่เสิร์ฟอาหารที่มีส่วนผสมของถั่วให้แก่แขก และมีอาการแพ้ขั้นรุนแรงจนนำไปสู่การส่งโรงพยาบาลฉุกเฉินและฟ้องร้องดำเนินคดี", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูตั้งคำถามเพื่อปลุกจิตสำนึก: 'นักเรียนคิดว่าความผิดพลาดนี้อยู่ที่ใคร ระหว่างคนจดออเดอร์ คนทำอาหาร หรือตัวลูกค้าเอง?' และ 'ในฐานะพนักงานโรงแรม เราจะใช้ระบบคำถามอย่างไรเพื่อคัดกรองปัญหานี้ก่อนที่อาหารจะออกจากครัว?'", "ผู้เรียนร่วมกันวิเคราะห์ ครูสรุปและนำเข้าสู่บทเรียนเรื่องการจัดการอาหารก่อภูมิแพ้และการเปลี่ยนเมนู"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี ผ่าน web app FINE Model (60 นาที)", "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อเข้าสู่ระบบ Interactive Guide เรื่อง 'สัญลักษณ์และคำศัพท์สารก่อภูมิแพ้มาตรฐานสากล (International Allergen Codes)'", "ผู้เรียนใช้ฟังก์ชัน AI Scan สแกนการ์ดเมนูอาหารจำลองของห้องอาหาร เพื่อวิเคราะห์หาส่วนประกอบที่ซ่อนอยู่ (เช่น ซอสบางชนิดมีส่วนผสมของแป้งสาลีหรือปลา) ระบบจะแสดงข้อมูลเตือนเป็นภาษาไทยและภาษาอังกฤษ", "ผู้เรียนทำใบงานจับคู่สารก่อภูมิแพ้กับเมนูอาหารที่มีความเสี่ยง และสรุปแนวทางการเปลี่ยนวัตถุดิบเบื้องต้นลงใน AI Scan Learning Record"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ผู้เรียนเปิดแอปพลิเคชัน Gemini และ Gemini Live บนอุปกรณ์ของตนเอง", "ภารกิจที่ 1 (Allergy Screening Mode): ผู้เรียนป้อน Prompt คำสั่งให้ Gemini สวมบทบาทเป็นลูกค้าที่มีอาการแพ้กลูเตนขั้นรุนแรง (Celiac Disease) ผู้เรียนต้องใช้ Gemini Live พูดคุยซักถาม แนะนำเมนูที่ปลอดภัย และใช้รูปประโยคยืนยันว่าจะแยกอุปกรณ์ในการปรุงอย่างเด็ดขาด", "ภารกิจที่ 2 (Emergency Substitution Challenge): ตั้งโจทย์ให้ Gemini แกล้งบอกหลังจากสั่งอาหารเสร็จแล้วว่า 'Oh, I forgot to tell you, I am highly allergic to peanuts. Is there peanut oil in that sauce?' ผู้เรียนต้องใช้ไหวพริบตอบโต้ทางเสียงผ่าน Gemini Live เพื่อระงับออเดอร์และเสนอเมนูเปลี่ยนทดแทนทันที", "ผู้เรียนจดบันทึกคำแนะนำด้านภาษาและข้อควรระวังที่ได้รับจากการหาข้อมูลลงใน AI Learning Record"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)", "ครูจำลองห้องปฏิบัติการห้องอาหารให้เป็นสถานการณ์ 'Allergy Alert Room'", "ผู้เรียนแบ่งกลุ่มเป็นทีมบริการ โดยครูมอบหมายบทบาทให้ผู้เรียนบางคนในกลุ่มสลับกันเป็นแขกที่มีอาการแพ้อาหารแตกต่างกัน (เช่น แพ้อาหารทะเล แพ้นมวัว)", "พนักงานบริการต้องเข้ามารับออเดอร์ สังเกตคำสัญญาณ (Keywords) สื่อสารภาษาอังกฤษซักถามระดับความรุนแรง บันทึกคำเตือนด้วยปากกาสีแดงเด่นชัดบนใบออเดอร์ (Captain Order) และประสานงานส่งต่อข้อมูลจำลองกับเชฟห้องครัว", "ครูสร้างสถานการณ์กดดัน เช่น เชฟแจ้งกลับมาว่าเมนูที่เลือกไม่สามารถทำแบบแยกสารภูมิแพ้ได้ พนักงานต้องกลับไปเจรจาเปลี่ยนเมนูใหม่กับแขกด้วยความสุภาพ"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)", "สุ่มตัวแทนออกมาทดสอบการรับออเดอร์แขกที่แพ้อาหารและการเปลี่ยนเมนู (Live Assessment) โดยประเมินความถูกต้องของข้อมูล", "ผู้เรียนทุกคนทำควิซออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อวัดความรู้ความเข้าใจเกี่ยวกับประเภทสารก่อภูมิแพ้และประโยคภาษาอังกฤษในการสื่อสารความปลอดภัย", "ครูสรุปคะแนนและประเมินผลผ่านเกณฑ์ Rubrics"]	["Reflection: ครูชวนผู้เรียนสะท้อนความคิดผ่านคำกล่าวที่ว่า 'ในงานบริการอาหาร ความใส่ใจเรื่องอาการแพ้ของลูกค้าเท่ากับการรักษาชีวิตของเขา'", "ผู้เรียนเขียน Exit Ticket: ระบุ 2 ข้อห้ามสำคัญในการรับออเดอร์แขกที่แพ้อาหาร และ 1 ประโยคภาษาอังกฤษที่มั่นใจที่สุดในการเสนอเปลี่ยนเมนู ส่งให้ครูผ่านระบบออนไลน์ก่อนออกจากห้องเรียน"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:22:15.085561+07	2026-09-16 18:22:15.085561+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:22:15.085561+07	published
lesson-plan-week-14	แผนการจัดการเรียนรู้ สัปดาห์ที่ 14: Handling Special Requests (6.3 Dealing with Unavailable Menu Items: การจัดการเมื่อเมนูหมดและการนำเสนอทางเลือกอื่นให้ลูกค้า)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 14	การจัดการในกรณีที่รายการอาหารหรือเครื่องดื่มหมด (Dealing with Unavailable Menu Items) เป็นทักษะการแก้ไขสถานการณ์เฉพาะหน้าที่สะท้อนถึงระดับความเป็นมืออาชีพของพนักงานบริการ พนักงานจำเป็นต้องทราบแนวทางปฏิบัติที่ถูกต้องเพื่อลดความไม่พึงพอใจของลูกค้า เรียนรู้โครงสร้างประโยคภาษาอังกฤษในการแจ้งข้อมูลอย่างสุภาพ และฝึกทักษะด้านศิลปะการขาย หรือการแนะนำเมนูทดแทนที่มีลักษณะและมูลค่าใกล้เคียงกัน โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับระบบคิดวิเคราะห์โต้ตอบอัจฉริยะ (Gemini และ Gemini Live) ฟังก์ชัน AI Scan ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลองเพื่อเสริมสร้างความมั่นใจและการสื่อสาร	["อธิบายหลักการและขั้นตอนในการแจ้งรายการอาหารหมดตามมาตรฐานการบริการได้", "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการขออภัยและนำเสนอเมนูทางเลือกอื่นได้อย่างถูกต้อง", "จำแนกกลุ่มอาหารทดแทนที่มีลักษณะ รสชาติ หรือวัตถุดิบใกล้เคียงกันเพื่อใช้ในการแนะนำลูกค้าได้"]	["สื่อสารภาษาอังกฤษเพื่อขอโทษและเสนอทางเลือกทดแทนได้และถูกต้อง", "ใช้เทคโนโลยี AI Scan ผ่าน web app FINE Model ในการตรวจสอบส่วนผสมของเมนูแนะนำ และใช้ Gemini Live ในการฝึกฝนบทสนทนาโต้ตอบเสียงได้", "แสดงทักษะการเจรจาจูงใจเพื่อรักษาบรรยากาศที่ดีและปิดการรับออเดอร์ในสถานการณ์จำลองได้"]	["มีไหวพริบและความยืดหยุ่นในการแก้ไขปัญหาเฉพาะหน้า", "มีความมั่นใจในตนเองและควบคุมอารมณ์ภายใต้สถานการณ์กดดันได้ดี", "แสดงออกถึงความเห็นใจ และมีความพร้อมที่จะช่วยเหลือลูกค้าตลอดเวลา"]	["ประยุกต์ใช้เทคนิคการจับคู่เมนูทางเลือกเพื่อนำเสนอขายรายการอาหารอื่นแทนรายการที่หมดได้อย่างคล่องแคล่ว", "แก้ไขสถานการณ์ในห้องอาหารจำลองเมื่อลูกค้าปฏิเสธตัวเลือกที่พนักงานนำเสนอได้อย่างมืออาชีพ", "บูรณาการศิลปะการขาย (Upselling/Cross-selling) ร่วมกับการแก้ปัญหารายการอาหารหมดเพื่อรักษามาตรฐานรายได้และความพึงพอใจ"]	[{"word": "Out of stock / Sold out", "meaning": "สินค้าหมด / จำหน่ายหมดแล้ว"}, {"word": "Unavailable", "meaning": "ไม่พร้อมบริการ / ไม่มีให้บริการในขณะนั้น"}, {"word": "Ingredient", "meaning": "วัตถุดิบหรือส่วนประกอบในการปรุงอาหาร"}, {"word": "Alternative / Substitute", "meaning": "สิ่งทดแทน / ทางเลือกอื่นทดแทน"}, {"word": "Suggesting Alternatives", "meaning": "การนำเสนอและแนะนำเมนูทางเลือก"}, {"word": "Polite Apologies", "meaning": "การกล่าวคำขออภัยอย่างสุภาพและจริงใจ"}, {"word": "Menu Substitution Flow", "meaning": "กระบวนการจับคู่รายการอาหารทดแทนตามลำดับขั้นตอน"}, {"word": "Conflict Situation Cards", "meaning": "การ์ดสถานการณ์จำลองความขัดแย้งและข้อจำกัด"}, {"word": "Cross-selling", "meaning": "การแนะนำขายสินค้าหรือบริการเสริมเพิ่มเติม"}, {"word": "Positive Communication", "meaning": "การสื่อสารเชิงบวกเพื่อลดความผิดหวังของลูกค้า"}, {"word": "Fluency & Hospitality Tone", "meaning": "ความลื่นไหลและน้ำเสียงที่เปี่ยมด้วยจิตบริการ"}, {"word": "Baked Sea Bass", "meaning": "ปลากะพงอบ (เมนูซีฟู้ดทดแทนปลาแซลมอน)"}]	["I am terribly sorry, sir/madam, but the [Grilled Salmon] is currently unavailable tonight.", "Unfortunately, we have just run out of the [Lobster Soup].", "However, may I highly recommend our [Baked Sea Bass]? It is also a seafood dish and is freshly caught today.", "As an alternative, we have a wonderful [Ribeye Steak] which is prepared in a similar style."]	["ครูจัดกิจกรรม 'เมนูนี้ที่หายไป' โดยให้ผู้เรียนสุ่มหยิบการ์ดเมนูโปรดขึ้นมา จากนั้นครูประกาศทันทีว่า 'เมนูที่นักเรียนเลือกหมด' และสังเกตปฏิกิริยาแรกของผู้เรียน", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเชื่อมโยงเข้าสู่บทเรียน: 'ในฐานะลูกค้า ถ้าน้องๆ เดินเข้าร้านแล้วพนักงานบอกแค่ว่า เมนูนี้หมดค่ะ แล้วเงียบไป จะรู้สึกอย่างไร?' และ 'คำพูดภาษาอังกฤษแบบไหนที่จะเปลี่ยนความผิดหวังของลูกค้า ให้กลายมาเป็นความสนใจสั่งเมนูอื่นแทน?'", "ผู้เรียนร่วมกันอภิปราย ครูสรุปแนวคิดการเปลี่ยนวิกฤตให้เป็นโอกาสในงานบริการและชี้แจงจุดประสงค์การเรียนรู้"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)", "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อศึกษา Flowchart Interactive 'กระบวนการจับคู่รายการอาหารทดแทนเมื่อวัตถุดิบหลักหมด (Menu Substitution Flow)'", "ผู้เรียนใช้ฟังก์ชัน AI Scan สแกนเล่มเมนูจำลองของห้องอาหาร เพื่อวิเคราะห์หาจุดเด่น รสชาติ และระดับราคาของอาหารแต่ละจาน จากนั้นบันทึกรายการอาหารที่สามารถแนะนำทดแทนกันได้ลงใน AI Scan Learning Record", "ผู้เรียนจับคู่ฝึกออกเสียงกลุ่มคำศัพท์และสำนวนประโยคการขอโทษและการเสนอทางเลือกตามเอกสารประกอบการเรียน"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ผู้เรียนเข้าใช้งานแอปพลิเคชัน Gemini และ Gemini Live บนอุปกรณ์สื่อสารส่วนตัว", "ภารกิจที่ 1 (Apology & Alternative Pattern): ผู้เรียนสั่งการให้ Gemini สวมบทบาทเป็นลูกค้าชาวต่างชาติที่ตั้งใจมาทานเมนูซิกเนเจอร์ของร้าน แต่ผู้เรียนต้องใช้ Gemini Live แจ้งว่าเมนูนั้นหมด พร้อมเสนอเมนูอื่นที่มีความคล้ายคลึงกัน โดยต้องทำให้ AI ยอมตกลงสั่งซื้อเมนูทางเลือกนั้น", "ภารกิจที่ 2 (Difficult Guest Challenge): ตั้งโจทย์ให้ Gemini แสดงอารมณ์หงุดหงิดหรือปฏิเสธตัวเลือกแรกที่เสนอไป ('But I specifically came here for that dish! What else do you have?') ผู้เรียนต้องใช้ทักษะการฟังและพูดคุยทางเสียงเพื่อเสนอตัวเลือกที่สองหรือสิทธิประโยชน์อื่น", "ผู้เรียนบันทึกผล Feedback และข้อเด่นที่ได้จากการโต้ตอบลงใน AI Learning Record"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)", "ครูจัดพื้นที่ห้องปฏิบัติการให้เป็นห้องอาหารจำลอง โดยมอบหมาย 'การ์ดสถานการณ์จำลองความขัดแย้ง (Conflict Situation Cards)' ให้แต่ละกลุ่ม", "โจทย์จำลอง: 'ลูกค้าสั่งไวน์แดงยี่ห้อเฉพาะเพื่อฉลองวันครบรอบแต่งงาน แต่ไวน์รุ่นนั้นหมด พนักงานเสิร์ฟต้องเข้าไปขออภัย แนะนำไวน์รุ่นอื่นที่มีรสชาติบอดี้ใกล้เคียงกัน พร้อมนำเสนอการบริการเสริมเพื่อชดเชยความรู้สึก'", "ผู้เรียนในกลุ่มแบ่งบทบาทหน้าที่ ปฏิบัติการรับออเดอร์และแก้ไขสถานการณ์ร่วมกัน บันทึกการเปลี่ยนรายการลงในใบออเดอร์พร้อมทำสัญลักษณ์อัปเดตระบบ ครูคอยแทรกปัญหาเฉพาะหน้าเพื่อทดสอบปฏิภาณไหวพริบ"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)", "สุ่มตัวแทนกลุ่มออกมาแสดงบทบาทสมมติในการแก้ปัญหาเมนูหมดหน้าชั้นเรียน โดยเน้นการประเมินบุคลิกภาพ การใช้น้ำเสียง และความลื่นไหลในการสนทนา (Fluency & Hospitality Tone)", "ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อวัดความเข้าใจในโครงสร้างประโยคและหลักการแก้ปัญหาเมื่อรายการอาหารหมด", "ครูประเมินผลการปฏิบัติงานตามเกณฑ์มาตรฐาน Rubrics"]	["Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: หัวใจของการจัดการเมื่อเมนูหมดไม่ใช่แค่การบอกว่าไม่มี แต่คือการส่งมอบ 'ทางเลือกที่ดีที่สุด' ให้แก่ลูกค้าทันทีโดยไม่ต้องให้ลูกค้าร้องขอ", "ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์สำนวนภาษาอังกฤษในการแนะนำเมนูทดแทนที่ตนเองคิดว่าประทับใจที่สุด 1 ประโยค ส่งเข้าสู่ระบบจัดเก็บข้อมูลก่อนปิดการเรียนเรียนรู้"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:37:34.798307+07	2026-09-16 18:37:34.798307+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:37:34.798307+07	published
lesson-plan-week-15	แผนการจัดการเรียนรู้ สัปดาห์ที่ 15: Handling Customer Complaints (7.1 Handling Customer Complaints: การรับฟังปัญหาและการตอบสนองต่อข้อร้องเรียนอย่างเหมาะสม)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 15	การจัดการข้อร้องเรียนของลูกค้าเป็นทักษะที่มีความสำคัญ ในงานบริการอาหารและเครื่องดื่ม พนักงานจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับจิตวิทยาบริการ กระบวนการรับฟังอย่างใส่ใจ และสามารถใช้ภาษาอังกฤษเพื่อการแสดงความเสียใจ และแสดงความรับผิดชอบได้อย่างมืออาชีพ โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับระบบประมวลผลอัจฉริยะ Gemini และ Gemini Live ในการฝึกฝนบทสนทนาโต้ตอบเสมือนจริงทางเสียง ควบคู่กับการใช้ฟังก์ชัน AI Scan ร่วมกับสถานการณ์จำลอง (Simulation-Based Learning) โดยใช้เทคโนโลยีผ่าน web app FINE Model เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษในวิชาชีพการโรงแรม	["อธิบายหลักการและขั้นตอนการรับมือข้อร้องเรียน (เช่น หลัก LAST: Listen, Apologize, Solve, Thank) ได้อย่างถูกต้อง", "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการแสดงความเสียใจและการยอมรับข้อผิดพลาดได้ถูกต้อง", "จำแนกประเภทของข้อร้องเรียนในห้องอาหาร (ด้านอาหาร ด้านบริการ และด้านสิ่งแวดล้อม) ได้"]	["ใช้ประโยคภาษาอังกฤษในการพูดตอบสนองต่อข้อร้องเรียนของลูกค้าได้อย่างสุภาพและเป็นมืออาชีพ", "ประยุกต์ใช้ระบบ Gemini และ Gemini Live ผ่าน web app FINE Model ในการฝึกฟังและโต้ตอบบทสนทนาข้อร้องเรียนทางเสียงได้อย่างลื่นไหล", "ปฏิบัติงานและแสดงพฤติกรรมการรับฟังอย่างใส่ใจ (Active Listening) ในสถานการณ์จำลองได้ถูกต้อง"]	["ความอดทน อดกลั้น และสามารถควบคุมอารมณ์ภายใต้สภาวะกดดันได้ดี", "เจตคติที่ดีต่อการจัดการข้อร้องเรียน โดยมองว่าเป็นโอกาสในการพัฒนาบริการ (Service Mind)", "บุคลิกภาพ และภาษากายที่เหมาะสม ในการปฏิสัมพันธ์กับผู้รับบริการ"]	["ประยุกต์ใช้ทักษะภาษาอังกฤษ และหลักการรับฟังเพื่อระงับอารมณ์ของลูกค้าในสถานการณ์วิกฤตได้จริง", "เลือกแนวทางการรายงานปัญหา และประสานงานต่อไปยังผู้เกี่ยวข้องได้อย่างเหมาะสม", "ประยุกต์ใช้คำศัพท์และจิตวิทยาบริการในการคลายความตึงเครียดของลูกค้าในห้องอาหารจำลองได้"]	[{"word": "Complaint", "meaning": "ข้อร้องเรียน / คำตำหนิของลูกค้า"}, {"word": "Apologize", "meaning": "การกล่าวคำขออภัยอย่างเป็นทางการ"}, {"word": "Dissatisfied", "meaning": "ไม่พึงพอใจในอาหารหรือการบริการ"}, {"word": "Inconvenience", "meaning": "ความไม่สะดวกสบายที่เกิดขึ้นแก่ลูกค้า"}, {"word": "Immediate action", "meaning": "การดำเนินการแก้ไขปัญหาในทันที"}, {"word": "LAST Model", "meaning": "ขั้นตอนรับมือข้อร้องเรียน (Listen, Apologize, Solve, Thank)"}, {"word": "Active Listening", "meaning": "การรับฟังอย่างตั้งใจและไม่โต้แย้ง"}, {"word": "Gathering Information", "meaning": "การสอบถามข้อมูลเพิ่มเติมเพื่อตรวจสอบข้อเท็จจริง"}, {"word": "Frustration", "meaning": "ความหงุดหงิดหรือความคับข้องใจของลูกค้า"}, {"word": "Sincere apologies", "meaning": "คำขออภัยอย่างจริงใจจากใจจริง"}, {"word": "Crisis Control Room", "meaning": "ห้องปฏิบัติการจำลองสถานการณ์วิกฤตการบริการ"}, {"word": "Tone of Voice", "meaning": "น้ำเสียงที่นุ่มนวลและแสดงความเห็นอกเห็นใจ"}]	["I am terribly sorry for the inconvenience, sir/madam.", "Please accept our sincere apologies for this mistake.", "I understand your frustration, and I will look into this right away.", "Could you please tell me more about what happened?", "I deeply apologize for this, sir. Let me replace this dish for you immediately."]	["ครูเปิดคลิปวิดีโอสถานการณ์จำลอง 'A Disgruntled Guest in a Luxury Restaurant' (ลูกค้าที่ไม่พอใจอย่างรุนแรงในห้องอาหาร) เพื่อให้ผู้เรียนสังเกตปฏิกิริยาของลูกค้าและพนักงาน", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อเชื่อมโยงความรู้สึกและประสบการณ์: 'จากวิดีโอ หากนักเรียนเป็นพนักงานบริการ สิ่งแรกที่ต้องทำเมื่อลูกค้าเริ่มส่งเสียงดังคืออะไร?' และ 'ถ้านักเรียนใช้คำว่า It is not my fault (ไม่ใช่ความผิดของฉัน) กับลูกค้า จะเกิดอะไรขึ้นตามมา?'", "ผู้เรียนร่วมกันแสดงความคิดเห็นอย่างอิสระ ครูเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)", "ครูแจกใบงานกรณีศึกษาข้อร้องเรียน (Complaint Case Studies) ประเภทต่างๆ", "ผู้เรียนใช้เครื่องมือ AI Scan สแกนรูปภาพในใบงานเพื่อวิเคราะห์ระดับอารมณ์ของลูกค้าและระบุประเภทของปัญหา (เช่น อาหารดิบเกินไป พนักงานเสิร์ฟผิดโต๊ะ หรือรอนาน)", "ผู้เรียนศึกษาประโยคตัวอย่างภาษาอังกฤษที่ระบบแสดงขึ้นมาเพื่อเป็นแนวทางในการตอบสนอง จากนั้นบันทึกข้อมูลลงใน AI Scan Learning Record ผ่าน web app FINE Model", "ภารกิจกลุ่มย่อย: ผู้เรียนร่วมกันจัดกลุ่มข้อร้องเรียนและฝึกจับคู่คำศัพท์ภาษาอังกฤษที่แสดงถึงความรู้สึกของลูกค้าและขั้นตอน LAST Model"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ครูมอบหมายภารกิจฝึกการฟัง และการพูดโต้ตอบข้อร้องเรียน โดยใช้ระบบ Gemini และ Gemini Live", "ผู้เรียนเปิดแอปพลิเคชันและใช้งานโหมดสนทนาทางเสียงกับ Gemini Live โดยกำหนดบทบาทให้ AI เป็น 'ลูกค้าที่กำลังโกรธเนื่องจากพบเส้นผมในจานอาหาร'", "ผู้เรียนต้องฝึกฟังข้อร้องเรียนภาษาอังกฤษจาก AI และตอบโต้ด้วยประโยคกล่าวขออภัยอย่างเป็นทางการตามโครงสร้าง เช่น 'I deeply apologize for this, sir. Let me replace this dish for you immediately.'", "จับคู่ฝึกปฏิบัติ (Pair Work): ผู้เรียนสลับกันฝึกโต้ตอบ โดยมี AI คอยให้คะแนนและคำแนะนำด้านน้ำเสียง (Tone of Voice) สุภาพ และความถูกต้อง บันทึกลงใน Gemini Live Session Log"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)", "ครูแบ่งผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมสถานการณ์จำลอง 'Crisis Control Room' ในห้องปฏิบัติการห้องอาหารจำลอง (Restaurant Simulation)", "สถานการณ์จำลอง: ครูหรือตัวแทนผู้เรียนสวมบทบาทเป็นลูกค้าที่เข้ามาตำหนิบริการอย่างรุนแรงหน้างาน", "ผู้เรียนในทีมต้องประยุกต์ใช้หลักการฟังอย่างใส่ใจ (Active Listening) ห้ามพูดแทรก แสดงภาษากายที่เหมาะสม และกล่าวประโยคภาษาอังกฤษเพื่อระงับอารมณ์ของลูกค้าให้สงบลง", "ครูเพิ่มความท้าทายโดยเปลี่ยนเงื่อนไขข้อร้องเรียนกลางคัน เพื่อให้ผู้เรียนใช้ทักษะการคิดแก้ปัญหาเฉพาะหน้า"]	["E – Exhibit Professional Performance : การลงมือปฏิบัติจริง (35 นาที)", "แต่ละทีมส่งตัวแทนออกมาแสดงบทบาทสมมติในการรับมือกับข้อร้องเรียนภาษาอังกฤษหน้าชั้นเรียน โดยครูและเพื่อนร่วมกันประเมิน", "ผู้เรียนทุกคนทำ Quiz ทดสอบสำนวนและประโยคภาษาอังกฤษในการจัดการข้อร้องเรียนผ่าน web app FINE Model", "ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่มด้วยเกณฑ์ Rubrics"]	["Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: ความสำคัญของการฟังโดยไม่แก้ตัว ทักษะการสบตา และการเลือกใช้คำศัพท์ภาษาอังกฤษที่แสดงความเห็นใจลูกค้า", "ผู้เรียนทำกิจกรรม Exit Ticket: เขียนประโยคภาษาอังกฤษที่ทรงประสิทธิภาพที่สุด 3 ประโยคในการจัดการกับความโกรธของลูกค้า ส่งผ่านระบบออนไลน์ก่อนออกจากห้องเรียน"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:40:07.990024+07	2026-09-16 18:40:07.990024+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:40:07.990024+07	published
lesson-plan-week-16	แผนการจัดการเรียนรู้ สัปดาห์ที่ 16: Handling Customer Complaints (7.2 Service Recovery: การแก้ไขสถานการณ์เฉพาะหน้าและสร้างความพึงพอใจตามมาตรฐานสากล)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 16	การชดเชยและรักษาคุณภาพการให้บริการ (Service Recovery) เป็นกระบวนการเปลี่ยนวิกฤตความไม่พึงพอใจของลูกค้าให้กลับมาเป็นความประทับใจและความภักดีต่อองค์กร พนักงานบริการอาหารและเครื่องดื่มจำเป็นต้องเรียนรู้วิธีวิเคราะห์ความรุนแรงของข้อร้องเรียน การตัดสินใจมอบสิ่งชดเชยที่เหมาะสมตามข้อกำหนดของสถานประกอบการ และการใช้ทักษะภาษาอังกฤษเพื่อยื่นข้อเสนอ การปิดการสนทนาอย่างราบรื่น โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับระบบประมวลผลอัจฉริยะ Gemini และ Gemini Live ผ่าน web app FINE Model ในการจำลองบทสนทนาโต้ตอบทางเสียงเพื่อฝึกการเจรจาต่อรองในสถานการณ์กดดัน ควบคู่กับกิจกรรมห้องอาหารจำลอง (Restaurant Simulation) เพื่อสร้างทักษะการตัดสินใจแก้ปัญหาเฉพาะหน้าและการบริการที่เป็นเลิศตามมาตรฐานโรงแรม	["อธิบายขั้นตอนการกู้คืนคุณภาพบริการ (Service Recovery Process) ตามมาตรฐานสากลได้อย่างถูกต้อง", "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการเสนอทางเลือก การชดเชย และการสร้างความพึงพอใจต่อลูกค้าได้ถูกต้อง", "บอกหลักเกณฑ์และขอบเขตหน้าที่ของพนักงานในการมอบสิ่งชดเชย (เช่น การเปลี่ยนจานใหม่ การมอบส่วนลด หรือเครื่องดื่มสมนาคุณ) ได้"]	["พูดนำเสนอทางเลือก และวิธีแก้ไขปัญหาให้แก่ลูกค้าเป็นภาษาอังกฤษได้อย่างเหมาะสม", "ประยุกต์ใช้ระบบ Gemini Live ในการเจรจาระงับความขัดแย้งและยื่นข้อเสนอชดเชยทางเสียงได้ถูกต้อง", "ปฏิบัติขั้นตอนการชดเชยความพึงพอใจของลูกค้าในสถานการณ์จำลองหน้างานได้อย่างถูกต้อง"]	["แสดงออกถึงความรับผิดชอบและจรรยาบรรณในการแก้ไขความผิดพลาด", "มีความยืดหยุ่นและใจเย็นในการเผชิญหน้ากับพฤติกรรมเรียกร้องของลูกค้า (Customer-Centric Mindset)", "มีความเชื่อมั่นและกล้าตัดสินใจภายใต้กฎระเบียบของห้องอาหาร"]	["สามารถวิเคราะห์ระดับความรุนแรงของปัญหา และเลือกใช้วิธีการชดเชยที่เหมาะสมกับสถานการณ์จริงได้", "สรุปรายงานข้อร้องเรียนและการแก้ไขปัญหา (Service Recovery Log) เพื่อส่งต่อข้อมูลและป้องกันการเกิดซ้ำได้อย่างเป็นระบบ", "พลิกสถานการณ์วิกฤตหน้างานให้ลูกค้าเปลี่ยนจากความโกรธเป็นความพึงพอใจต่อการรับบริการ และยอมรับข้อเสนอชดเชย"]	[{"word": "Service Recovery", "meaning": "การชดเชยและกู้คืนคุณภาพการให้บริการเมื่อเกิดข้อผิดพลาด"}, {"word": "Compensate", "meaning": "การชดเชยความเสียหายหรือความไม่พึงพอใจ"}, {"word": "On the house / Complimentary", "meaning": "การมอบให้ฟรีโดยทางร้านรับผิดชอบค่าใช้จ่าย (สมนาคุณ)"}, {"word": "Waive the charge", "meaning": "การยกเว้นค่าบริการหรือยกเลิกการคิดเงินรายการนั้น"}, {"word": "Replacement", "meaning": "การเปลี่ยนอาหารจานใหม่ทดแทนจานเดิม"}, {"word": "Discount", "meaning": "การมอบส่วนลดพิเศษเพื่อชดเชยความรู้สึก"}, {"word": "Service Recovery Matrix", "meaning": "ตารางเกณฑ์การตัดสินใจมอบสิ่งชดเชยตามระดับปัญหา"}, {"word": "Guest Complaint & Recovery Log", "meaning": "แบบฟอร์มบันทึกข้อร้องเรียนและการฟื้นฟูบริการ"}, {"word": "Customer-Centric Mindset", "meaning": "กรอบความคิดที่ยึดความพึงพอใจของลูกค้าเป็นศูนย์กลาง"}, {"word": "Offering Solutions", "meaning": "การนำเสนอทางเลือกและวิธีแก้ไขปัญหาอย่างสร้างสรรค์"}, {"word": "Follow-up & Closing", "meaning": "การติดตามความพึงพอใจหลังแก้ไขและการปิดการสนทนา"}, {"word": "Unseen Scenario", "meaning": "สถานการณ์จำลองเฉพาะหน้าแบบไม่แจ้งโจทย์ล่วงหน้า"}]	["To make up for this, we would like to offer you a complimentary dessert.", "I would be happy to replace this dish for you immediately. It will take about 5 minutes.", "Is everything to your satisfaction now, sir/madam?", "Thank you for your patience and understanding. Enjoy the rest of your meal."]	["ครูเปิดแถลงการณ์จำลองภาพนิ่งหรือกรณีศึกษาจริงของโรงแรมระดับโลกที่พลิกสถานการณ์จากลูกค้าที่กำลังจะรีวิว 1 ดาว ให้กลับมารีวิว 5 ดาว ด้วยกระบวนการกู้คืนบริการที่ยอดเยี่ยม", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูตั้งคำถามชวนคิด: 'หากเราขอโทษลูกค้าอย่างจริงใจแล้ว แต่ลูกค้ายังคงไม่พึงพอใจและต้องการเปลี่ยนจานใหม่ทันที เราควรเสนอสิ่งใดเพิ่มเติมเพื่อรักษาความรู้สึกของลูกค้า?' และ 'คำว่า On the house กับ Free of charge ในงานโรงแรมสร้างความรู้สึกให้ลูกค้าแตกต่างกันอย่างไร?'", "ผู้เรียนร่วมกันอภิปราย ครูสรุปเชื่อมโยงเข้าสู่เรื่องการชดเชยและแก้ไขสถานการณ์เฉพาะหน้า (Service Recovery)"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)", "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อศึกษาลำดับขั้นการตัดสินใจ 'Service Recovery Matrix' (การจับคู่ประเภทปัญหาขั้นวิกฤตกับสิ่งชดเชยที่เหมาะสม)", "ผู้เรียนใช้ฟังก์ชัน AI Scan สแกนใบงานกรณีวิเคราะห์ (Recovery Scenario Cards) เพื่อศึกษาโครงสร้างประโยคภาษาอังกฤษในการยื่นข้อเสนอและขอยกเว้นค่าบริการอย่างเป็นทางการ", "ผู้เรียนสรุปแนวทางและคำศัพท์ที่สำคัญลงในบันทึกผล AI Scan Learning Record"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ผู้เรียนเข้าใช้งานแอปพลิเคชัน Gemini และเปิดโหมดสนทนาเสียง Gemini Live บนสมาร์ตโฟน", "ภารกิจที่ 1 (Negotiation Challenge): ผู้เรียนตั้ง Prompt ให้ Gemini สวมบทบาทเป็น 'ลูกค้าผู้เข้มงวดที่ปฏิเสธคำขอโทษ และต้องการโพสต์ร้องเรียนลงโซเชียลมีเดียเนื่องจากพบสิ่งแปลกปลอมในอาหาร' ผู้เรียนต้องใช้ Gemini Live พูดเจรจายื่นข้อเสนอชดเชย (เช่น การเปลี่ยนอาหารจานใหม่พร้อมมอบส่วนลด 20%) เป็นภาษาอังกฤษเพื่อโน้มน้าวใจให้ลูกค้ายอมรับ", "ภารกิจที่ 2 (Satisfaction Check): ผู้เรียนต้องฝึกพูดประโยคติดตามผลเพื่อทวนสอบความพึงพอใจหลังการชดเชยด้วยน้ำเสียงที่สุภาพและจริงใจ หาก AI ตรวจพบว่าน้ำเสียงของผู้เรียนไม่มีความกระตือรือร้น AI จะจำลองปฏิกิริยาไม่ยอมรับข้อเสนอ", "ผู้เรียนบันทึกแนวทางคำพูดที่สำเร็จและผล Feedback จาก AI ลงใน AI Learning Record"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)", "ครูใช้พื้นที่ห้องปฏิบัติการห้องอาหารจำลอง (Restaurant Simulation) ในการจัดกิจกรรม 'The Ultimate Service Recovery Challenge'", "ครูและกลุ่มผู้เรียนสลับบทบาทเป็นกลุ่มลูกค้าที่เผชิญปัญหาร้ายแรงหน้างาน (เช่น ระบบแจ้งออเดอร์ตกหล่นทำให้รอนานกว่า 30 นาที หรือพนักงานทำเครื่องดื่มหกรดเสื้อผ้าของลูกค้า)", "ผู้เรียนที่ปฏิบัติหน้าที่พนักงานต้องเข้าควบคุมสถานการณ์ นำหลักการแก้ปัญหาเฉพาะหน้ามาใช้ พูดประโยคยื่นข้อเสนอชดเชยตามขอบเขตในการตัดสินใจ และปฏิบัติขั้นตอนทดแทนบริการอย่างรวดเร็ว พร้อมทั้งบันทึกข้อมูลลงใน Guest Complaint & Recovery Log"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)", "สุ่มผู้เรียนออกมารับสถานการณ์จำลองแบบสด (Unseen Scenario) หน้าชั้นเรียนทีละคู่ เพื่อทดสอบไหวพริบ และการใช้ภาษาอังกฤษในการระงับเหตุและชดเชยบริการ", "ผู้เรียนทุกคนทำควิซออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อทดสอบความรู้ความเข้าใจเกี่ยวกับหลักเกณฑ์การชดเชย และโครงสร้างประโยค Service Recovery", "ครูประเมินผลการปฏิบัติงานตามเกณฑ์มาตรฐาน Rubrics"]	["Reflection: ครูชวนผู้เรียนร่วมสรุปบทเรียน: 'การทำ Service Recovery ที่ดี ไม่ใช่แค่การให้ของฟรี แต่คือการแสดงความใส่ใจและความรับผิดชอบที่เหนือความคาดหมายของลูกค้า'", "ผู้เรียนทำกิจกรรม Exit Ticket: ระบุ 1 วิธีการชดเชยที่คิดว่ามีประสิทธิภาพที่สุด และเขียนประโยคภาษาอังกฤษในการเสนอสิ่งสมนาคุณ 1 ประโยค ส่งครูผ่านระบบออนไลน์ก่อนจบคาบเรียน"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:43:09.44907+07	2026-09-16 18:43:09.44907+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:43:09.44907+07	published
lesson-plan-week-17	แผนการจัดการเรียนรู้ สัปดาห์ที่ 17: Professional Performance (8.1 - 8.6 Core Service Cycle Practice: การฝึกปฏิบัติบริการครบวงจรและการบริการพิเศษ)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 17	การบูรณาการความรู้และทักษะปฏิบัติในงานบริการอาหารและเครื่องดื่มถือเป็นทักษะสำคัญของการเรียนรู้วิชาชีพการโรงแรม ผู้เรียนจำเป็นต้องนำความรู้ตั้งแต่การต้อนรับ การรับออเดอร์ การเสิร์ฟอาหารและเครื่องดื่ม ตลอดจนทักษะการบริการพิเศษ เช่น บริการอาหารในห้องพัก (Room Service) การบริการแบบรถเข็น (Gueridon Service) และกระบวนการเรียกเก็บเงิน (Billing) มาประยุกต์ใช้ร่วมกันอย่างเป็นระบบ การจัดการเรียนรู้สัปดาห์นี้ใช้รูปแบบ FINE Model ร่วมกับเทคโนโลยีการจำลองสถานการณ์เสมือนจริง (Restaurant Simulation) ผ่าน web app FINE Model เพื่อทดสอบและขัดเกลาสมรรถนะผู้เรียนให้ก้าวไปสู่มาตรฐานการทำงานระดับมืออาชีพในสถานการณ์จริงได้	["อธิบายขั้นตอนการบริการอาหารและเครื่องดื่มแบบครบกระบวนการ (Core Service Cycle) ได้ถูกต้อง", "อธิบายขั้นตอนการให้บริการแบบ Room Service และ Gueridon Service ได้อย่างถูกต้อง", "ระบุโครงสร้างประโยคภาษาอังกฤษในการนำเสนอเอกสารเรียกเก็บเงินและการปิดการบริการได้อย่างถูกต้อง"]	["ปฏิบัติงานบริการอาหาร เครื่องดื่ม บริการบนรถเข็น และบริการในห้องพักตามลำดับขั้นตอนได้อย่างคล่องแคล่ว", "สื่อสารภาษาอังกฤษในแต่ละสถานการณ์การบริการได้อย่างถูกต้อง", "ใช้งานระบบดิจิทัลและการประสานงานผ่านเทคโนโลยีเพื่อจัดการรายการอาหารและบิลค่าใช้จ่ายได้"]	["บุคลิกภาพที่ดี ถูกต้องตามสุขอนามัยและมาตรฐานวิชาชีพการโรงแรม", "ความยืดหยุ่น และการทำงานร่วมกันเป็นทีมในบทบาทที่แตกต่างกันได้", "ความใส่ใจในรายละเอียดและจิตวิญญาณแห่งการบริการ"]	["เชื่อมโยงและปรับเปลี่ยนวิธีการบริการตามประเภทของลูกค้าและสถานการณ์ที่เกิดขึ้นจริงในห้องอาหารได้", "แก้ไขปัญหาหน้างานด้านกระบวนการเสิร์ฟและขั้นตอนการคิดเงินได้อย่างถูกต้องและสุภาพ", "บูรณาการทุกทักษะเพื่อรับมือกับลูกค้าตั้งแต่เดินเข้าร้านจนกระทั่งเดินออกจากร้านในสภาวะจำลองเสมือนจริง"]	[{"word": "Core Service Cycle", "meaning": "วงจรการบริการอาหารและเครื่องดื่มแบบครบกระบวนการ"}, {"word": "Special Services", "meaning": "การให้บริการพิเศษตามมาตรฐานโรงแรม"}, {"word": "Room Service", "meaning": "การบริการเสิร์ฟอาหารและเครื่องดื่มถึงห้องพัก"}, {"word": "Gueridon Service", "meaning": "การบริการปรุง ปรุงแต่ง หรือเสิร์ฟอาหารข้างโต๊ะด้วยรถเข็น"}, {"word": "Billing & Closing", "meaning": "ขั้นตอนการแจ้งยอดบิล การเรียกเก็บเงิน และการปิดการบริการ"}, {"word": "Tableware", "meaning": "อุปกรณ์บนโต๊ะอาหารครบชุด (จาน ชาม ช้อน ส้อม แก้ว)"}, {"word": "Greeter", "meaning": "พนักงานต้อนรับและนำทางลูกค้าสู่โต๊ะอาหาร"}, {"word": "Server", "meaning": "พนักงานเสิร์ฟอาหารและเครื่องดื่ม"}, {"word": "Gueridon Attendant", "meaning": "พนักงานผู้เชี่ยวชาญการบริการอาหารด้วยรถเข็นข้างโต๊ะ"}, {"word": "Cashier", "meaning": "พนักงานแคชเชียร์ตรวจสอบบิลและรับชำระเงิน"}, {"word": "Settle the bill", "meaning": "การชำระหรือเคลียร์ยอดค่าใช้จ่ายในบิล"}, {"word": "Service Sequence Quiz", "meaning": "แบบทดสอบประเมินความแม่นยำของลำดับขั้นตอนบริการ"}]	["Here is your bill, sir/madam. Whenever you are ready.", "How would you like to settle the bill, in cash or by credit card?", "Thank you very much for dining with us. We hope to welcome you back soon."]	["ครูเปิดวิดีโอประมวลภาพรวมการแข่งขันระดับมาตรฐานสากล 'WorldSkills Hospitality Service' เพื่อให้ผู้เรียนเห็นภาพความเป็นมืออาชีพ และความคล่องตัวในทุกขั้นตอนการบริการ", "กิจกรรมระดมสมอง (Brainstorming): ครูตั้งคำถามกระตุ้นความคิดเพื่อทบทวนความรู้เดิม: 'ถ้าระหว่างที่เรากำลังเสิร์ฟอาหารจานหลัก แขกโต๊ะข้างๆ เรียกขอเช็คบิลทันที นักเรียนจะจัดลำดับความสำคัญอย่างไร?' และ 'การบริการแบบรถเข็น Gueridon แตกต่างจากการเสิร์ฟจากถาดปกติในแง่ของความรู้สึกของแขกอย่างไร?'", "ผู้เรียนร่วมกันอภิปรายอย่างอิสระ ครูเชื่อมโยงเข้าสู่บทเรียนเรื่องการฝึกปฏิบัติแบบครบกระบวนการ"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (40 นาที)", "ครูแจกใบความรู้เกี่ยวกับ 'Core Service Cycle Map' ซึ่งเป็นรายละเอียดในการให้บริการ", "ผู้เรียนใช้เครื่องมือ AI Scan ผ่าน web app FINE Model สแกนสัญลักษณ์และโจทย์สถานการณ์ เพื่อวิเคราะห์ข้อมูลวิชาชีพ ลำดับก่อน-หลังในการเสิร์ฟ และตรวจสอบประโยคภาษาอังกฤษที่จำเป็นในแต่ละจุดบริการ", "ผู้เรียนบันทึกสรุปขั้นตอนการปฏิบัติงานลงใน AI Scan Learning Record ผ่าน web app FINE Model เพื่อใช้เป็นคู่มือประจำตัวในการฝึกปฏิบัติ"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ครูแบ่งพื้นที่ห้องปฏิบัติการออกเป็นสถานีย่อย: สถานีต้อนรับ, สถานีโต๊ะอาหารหลัก, สถานี Room Service และสถานี Gueridon", "ผู้เรียนจับคู่และใช้ระบบ Gemini และ Gemini Live ผ่าน web app FINE Model ในการซักซ้อมบทสนทนาภาษาอังกฤษเฉพาะหน้า โดยกำหนดให้ AI สุ่มบทบาทเป็นแขกประเภทต่างๆ เช่น แขกที่รีบเช็คบิลเพื่อไปขึ้นเครื่องบิน หรือแขกที่ถามรายละเอียดการคิดเงินในบิล", "ผู้เรียนฝึกฟังการโต้ตอบและรับคำแนะนำด้านความคล่องแคล่ว (Fluency) และระดับภาษาที่เป็นมืออาชีพจากระบบ AI ผ่าน web app FINE Model ก่อนลงพื้นที่ปฏิบัติงานจริง"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (70 นาที)", "ผู้เรียนรวมกลุ่มกันเป็นทีมแบ่งบทบาทหน้าที่: พนักงานต้อนรับ (Greeter), พนักงานเสิร์ฟ (Server), พนักงานบริการรถเข็น (Gueridon Attendant) และพนักงานตรวจบิล (Cashier)", "เข้าสู่กิจกรรม Restaurant Simulation Challenge: ครูทำการจำลองเปิดห้องอาหารเต็มรูปแบบ โดยกลุ่มที่ไม่ได้ปฏิบัติหน้าที่สวมบทบาทเป็นลูกค้าที่เข้ามาใช้บริการในหลากหลายรูปแบบ (Dining-in, Calling Room Service)", "ผู้เรียนในทีมต้องปฏิบัติงานจริง ตั้งแต่การจับผ้าปูโต๊ะ การรับออเดอร์ การเดินเสิร์ฟอาหารตามเข็มนาฬิกา การบริการอาหารข้างโต๊ะด้วยรถเข็น Gueridon ตลอดจนกระบวนการนับบิลเรียกเก็บเงินเป็นภาษาอังกฤษอย่างถูกต้อง", "ครูสร้างสถานการณ์หน้างาน (เช่น ออเดอร์ในครัวทำสลับโต๊ะ หรือระบบเครื่องคิดเงินขัดข้อง) เพื่อทดสอบทักษะการคิดวิเคราะห์และการประสานงานในทีม"]	["E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (40 นาที)", "ตัวแทนแต่ละกลุ่มปฏิบัติการแสดงวงจรบริการเต็มรูปแบบในจุดที่ได้รับคัดเลือกต่อหน้าครูและเพื่อนร่วมชั้นเรียน", "ผู้เรียนสลับบทบาทกันเข้าทำแบบทดสอบความแม่นยำของลำดับขั้นตอนบริการ (Service Sequence Quiz) ผ่าน web app FINE Model เพื่อวัดผลรายบุคคล", "ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่มและรายบุคคลด้วยเกณฑ์ Rubrics ที่อิงตามมาตรฐานสากล"]	["Reflection: ครูและผู้เรียนร่วมกันสะท้อนผลการปฏิบัติงาน: จุดเด่นที่ทำได้ดี เช่น ความนอบน้อมและการใช้ภาษาอังกฤษ และจุดที่ต้องปรับปรุง เช่น จังหวะการเสิร์ฟพร้อมกันและการรักษาความสะอาดบนรถเข็น", "ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์ข้อความสรุปสิ่งที่ตนเองต้องระวังในขั้นตอนการคิดเงินและการปิดบริการ ก่อนส่งเข้าสู่ระบบส่วนกลาง ท้ายคาบเรียน"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:45:31.453896+07	2026-09-16 18:45:31.453896+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:45:31.453896+07	published
lesson-plan-week-18	แผนการจัดการเรียนรู้ สัปดาห์ที่ 18: Professional Food and Beverage Service Performance (8.7 - 8.8 Evaluation & Reflection: การสะท้อนผลการเรียนรู้ จัดทำแฟ้มสะสมผลงาน และการประเมินสมรรถนะปลายภาค)	20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)	ปวช.1 สาขาวิชาการโรงแรม	ภาคเรียนที่ 1	4 ชั่วโมง (240 นาที)	ปวช.1 สาขาวิชาการโรงแรม	สัปดาห์ที่ 18	การจัดการเรียนรู้ในสัปดาห์สุดท้ายเป็นขั้นตอนการรวบยอดสมรรถนะวิชาชีพทั้งหมดที่ผู้เรียนได้สั่งสมมาตลอดทั้งภาคเรียน โดยเน้นกระบวนการสะท้อนคิด (Reflection) เพื่อให้ผู้เรียนมองเห็นความก้าวหน้า จุดแข็ง และสิ่งที่ควรพัฒนาของตนเอง รวมถึงการจัดทำแฟ้มสะสมผลงาน (Portfolio) เพื่อนำเสนอหลักฐานการเรียนรู้อย่างเป็นระบบ ควบคู่ไปกับการเข้ารับการประเมินสมรรถนะปลายภาค (Final Professional Performance Assessment) ในสถานการณ์จำลองระดับมาตรฐานสากล กระบวนการนี้ผสานพลังการเรียนรู้ผ่านเทคโนโลยี FINE Model ร่วมกับเครื่องมือปัญญาประดิษฐ์และระบบประเมินผล เพื่อตัดสินและรับรองความพร้อมของผู้เรียนในการก้าวสู่ภาคอุตสาหกรรมการบริการอาหารและเครื่องดื่มต่อไป	["อธิบายหลักการประเมินตนเองและกระบวนการสรุปผลการเรียนรู้งานบริการอาหารและเครื่องดื่มได้", "ระบุโครงสร้างการจัดทำแฟ้มสะสมผลงานวิชาชีพการโรงแรมในรูปแบบดิจิทัล (e-Portfolio) ได้อย่างถูกต้อง", "สรุปความเชื่อมโยงของมาตรฐานการทำงานในห้องอาหารระดับสากลและเกณฑ์การวัดผลระดับอาชีวศึกษาได้"]	["บูรณาการทักษะวิชาชีพและภาษาอังกฤษเพื่อผ่านการทดสอบสถานการณ์จำลองปลายภาคตามมาตรฐาน", "คัดเลือก เรียบเรียง และตรวจทานเนื้อหาหลักฐานการเรียนรู้เพื่อจัดทำแฟ้มสะสมผลงานได้", "ใช้เครื่องมือดิจิทัลและปัญญาประดิษฐ์ในการตรวจสอบ วิเคราะห์ผลคะแนน และสรุปประเด็นการเรียนรู้ของตนเอง"]	["เจตคติที่ดีและมีความภูมิใจในวิชาชีพการโรงแรมและการบริการอาหารและเครื่องดื่ม", "ความเป็นระเบียบเรียบร้อย ความถูกต้องชัดเจน และความซื่อสัตย์สุจริตในการประเมินผล", "ทักษะการยอมรับความคิดเห็นและพร้อมปรับปรุงพัฒนาตนเองอย่างต่อเนื่อง (Growth Mindset)"]	["นำทักษะการสะท้อนคิด (Reflection) ไปประยุกต์ใช้ในการประเมินประสิทธิภาพการทำงานของตนเองในชีวิตจริง", "ประยุกต์ใช้แฟ้มสะสมผลงาน (Portfolio) เป็นเครื่องมือในการนำเสนอโปรไฟล์เพื่อการสมัครงานหรือศึกษาต่อในอนาคต", "ต่อยอดทักษะการรวบรวมผลงานและประสบการณ์ไปใช้ในการเตรียมพร้อมเข้าสู่ตลาดแรงงาน"]	[{"word": "e-Portfolio", "meaning": "แฟ้มสะสมผลงานวิชาชีพในรูปแบบดิจิทัล"}, {"word": "Evaluation & Reflection", "meaning": "การประเมินผลสัมฤทธิ์และการสะท้อนคิดถอดบทเรียน"}, {"word": "Self-Assessment", "meaning": "การประเมินสมรรถนะและพัฒนาการของตนเอง"}, {"word": "Peer-Assessment", "meaning": "การประเมินผลงานและให้ข้อเสนอแนะระหว่างเพื่อนร่วมชั้น"}, {"word": "Viva Voce", "meaning": "การสอบปากเปล่า / การสอบสัมภาษณ์วิชาชีพจำลอง"}, {"word": "External Assessor", "meaning": "ผู้ประเมินภายนอกตามเกณฑ์มาตรฐานสมรรถนะ"}, {"word": "Learning Logs", "meaning": "บันทึกประวัติและพัฒนาการการเรียนรู้ประจำสัปดาห์"}, {"word": "Final Professional Performance Assessment", "meaning": "การประเมินสมรรถนะวิชาชีพภาคปฏิบัติปลายภาค"}, {"word": "Growth Mindset", "meaning": "กรอบความคิดที่พร้อมเรียนรู้และพัฒนาตนเองอย่างต่อเนื่อง"}, {"word": "Gallery Walk", "meaning": "กิจกรรมเดินชมนิทรรศการผลงานเพื่อแลกเปลี่ยนเรียนรู้"}, {"word": "Rubrics Sheet", "meaning": "เกณฑ์การวัดผลและประเมินระดับสมรรถนะมาตรฐาน"}, {"word": "My F&B Journey", "meaning": "บทความสะท้อนคิดการเดินทางสู่มืออาชีพงานบริการอาหารและเครื่องดื่ม"}]	["Throughout this semester, I have developed my professional food and beverage service skills.", "The most challenging part was handling difficult customer complaints and special dietary requests.", "I will apply this skill to my future hotel internship and career in hospitality.", "What is the correct procedure when a guest complains about undercooked food?", "How do you present the bill professionally?"]	["ครูเปิดวิดีโอประมวลภาพกิจกรรมและบรรยากาศการเรียนปฏิบัติของผู้เรียนตั้งแต่สัปดาห์ที่ 1 ถึงสัปดาห์ที่ 17 เพื่อกระตุ้นความทรงจำ และสร้างความภาคภูมิใจในพัฒนาการของผู้เรียน", "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามปลายเปิดเพื่อชวนคุย: 'ถ้าย้อนเวลากลับไปสัปดาห์แรก ทักษะด้านใดของตนเองที่นักเรียนรู้สึกว่ามีการเปลี่ยนแปลงและเติบโตมากที่สุด?' และ 'เพราะเหตุใด แฟ้มสะสมผลงาน (Portfolio) จึงเป็นสิ่งสำคัญที่จะยืนยันว่าเราคือคนทำงานโรงแรมมืออาชีพ ไม่ใช่แค่ผู้เรียนที่สอบผ่าน?'", "ผู้เรียนร่วมแชร์ความคิดเห็นร่วมกัน ครูสรุปและเชื่อมโยงสู่เป้าหมายของสัปดาห์แห่งการประเมินและถอดบทเรียน"]	["F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (40 นาที)", "ครูอธิบายโครงสร้าง และรายละเอียดการจัดทำ Portfolio ทั้งแบบรูปเล่มและแบบดิจิทัล (e-Portfolio)", "ผู้เรียนเข้าระบบ web app FINE Model สแกนตรวจสอบสรุปผลสัมฤทธิ์จากบันทึก Learning Record ของตนเองตลอดภาคเรียน เพื่อดึงข้อมูลคำศัพท์ ไวยากรณ์ และเทคนิคงานบริการที่บันทึกไว้ นำมาเรียบเรียงจัดกลุ่มลงในแฟ้มงาน", "ผู้เรียนจัดทำโครงร่างการสะท้อนคิดรายบุคคลในหัวข้อ My F&B Journey เป็นภาษาอังกฤษ"]	["I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)", "ครูมอบหมายภารกิจการประเมินทักษะการสื่อสารภาษาอังกฤษและการสัมภาษณ์สรุปบทเรียน", "ผู้เรียนใช้ระบบ Gemini และ Gemini Live ผ่าน web app FINE Model สื่อสารและตอบคำถามจำลองการสอบสัมภาษณ์วิชาชีพ (Viva Voce) โดยตั้งค่าให้ AI เป็นผู้ประเมินภายนอก (External Assessor) ป้อนคำถามทดสอบ เช่น 'What is the correct procedure when a guest complains about undercooked food?' หรือ 'How do you present the bill professionally?'", "ผู้เรียนฝึกตอบคำถามโต้ตอบแบบเรียลไทม์ และรับฟัง Feedback ด้านความถูกต้องในการใช้ภาษาและคำศัพท์วิชาชีพเพื่อนำมาบันทึกเป็นคะแนนส่วนหนึ่งในแฟ้มผลงาน"]	["N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (70 นาที)", "เข้าสู่ช่วง Final Professional Performance Assessment: ครูสุ่มโจทย์สถานการณ์จำลองระดับพลิกแพลงขั้นสูงสุด (เช่น การจัดการโต๊ะวีไอพีที่มีการสั่งอาหารจานพิเศษ มีข้อร้องเรียนเรื่องไวน์ และต้องการความรวดเร็วในการเช็คบิลพร้อมกัน)", "ผู้เรียนเข้ารับการทดสอบภาคปฏิบัติในพื้นที่จำลอง Restaurant Simulation เป็นรายกลุ่มและรายบุคคล โดยมีครูและกรรมการร่วมกันประเมินตามเกณฑ์ Rubrics มาตรฐานอาชีพ", "ระหว่างการทดสอบ ผู้เรียนต้องดึงสมรรถนะทุกหน่วยการเรียนรู้ ตั้งแต่การใช้อุปกรณ์ การจับคู่เครื่องดื่ม การรับมือคำขอพิเศษ และการคิดเงิน มาแสดงออกอย่างเป็นธรรมชาติตามเวลาที่กำหนด"]	["E – Exhibit Professional Performance: การจัดแสดงนิทรรศการแฟ้มผลงาน (40 นาที)", "ผู้เรียนจัดวางแฟ้มสะสมผลงาน (Portfolio) หรือเปิดแสดงหน้าจอ e-Portfolio ของตนเองบนโต๊ะปฏิบัติงานในรูปแบบนิทรรศการนวัตกรรมการเรียนรู้ (Gallery Walk)", "ผู้เรียนเดินชมผลงานของเพื่อนร่วมชั้น ทำการประเมินร่วมกัน (Peer-Assessment) ผ่านการเขียนชื่นชมและให้ข้อเสนอแนะ", "ครูประกาศผลการประเมินสมรรถนะ มอบเกียรติบัตรหรือรางวัลจำลองสำหรับผู้เรียนที่มีผลการปฏิบัติงานและการพัฒนาดีเด่น เพื่อสร้างขวัญและกำลังใจ"]	["Reflection: ครูและผู้เรียนร่วมกันสรุปภาพรวมของวิชาการบริการอาหารและเครื่องดื่ม เน้นย้ำว่าหัวใจสำคัญของการทำงานโรงแรม คือความเป็นเลิศในบริการ เทคโนโลยีเป็นเครื่องมือช่วยในการทำงาน แต่ภาษากาย รอยยิ้ม และความถูกต้อง คือสิ่งที่จะมัดใจลูกค้า", "ผู้เรียนทำกิจกรรม Exit Ticket ชิ้นสุดท้าย: เขียนเป้าหมายในอนาคตของตนเองในการฝึกงานหรือทำงานจริงลงในระบบดิจิทัลเพื่อปิดรายวิชาอย่างสมบูรณ์"]	ครูพิมพ์	krupim@ktc.ac.th	2026-09-16 18:48:04.578191+07	2026-09-16 18:48:04.578191+07	00000000-0000-0000-0000-000000000020	22222222-2222-2222-2222-222222222201	2026-09-16 18:48:04.578191+07	published
\.


--
-- Data for Name: generated_model_assets; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.generated_model_assets (id, owner_id, file_name, mime_type, size_bytes, file_data, created_at) FROM stdin;
\.


--
-- Data for Name: integration_settings; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.integration_settings (provider, api_key_encrypted, config_json, updated_by, updated_at) FROM stdin;
tripo	\N	{"modelVersion": "v2.5-20250123"}	\N	2026-08-30 09:25:37.447084+07
\.


--
-- Data for Name: learning_analytics; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.learning_analytics (id, student_id, course_id, date, knowledge_score, skills_score, attitude_score, competency_score, overall_score, lessons_completed, time_spent_minutes) FROM stdin;
\.


--
-- Data for Name: learning_events; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.learning_events (id, student_id, event_type, reference_type, reference_id, score, metadata_json, occurred_at) FROM stdin;
\.


--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.lesson_progress (id, student_id, lesson_id, status, score, time_spent_minutes, attempts, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.lessons (id, unit_id, title, content_type, content_url, content_body, duration_minutes, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: model_generation_jobs; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.model_generation_jobs (id, provider, external_task_id, created_by, ar_item_id, asset_id, prompt, negative_prompt, model_version, name_en, name_th, description, status, progress, glb_url, preview_url, error_message, raw_response, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at, link_url, read_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
faa77391-2330-4245-8097-af5fd897cedf	3ee2ad72-7942-4374-9d13-ae801096bf97	f18fd57feb8f288f4d769249f922ca12e954348abb8c3b9c90fee7c7b1278b16	2026-09-14 18:09:04.863+07	2026-09-14 17:49:04.866016+07	2026-09-14 17:49:04.863701+07
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.profiles (id, school_id, school_name, name, email, role, requested_role, approval_status, avatar_url, phone, bio, created_at, updated_at, pdpa_consent, pdpa_consent_at, pdpa_consent_version) FROM stdin;
00000000-0000-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	วิทยาลัยอาชีวศึกษา ตัวอย่าง	ครูพิมพ์ (ทดสอบ)	teacher@local.test	teacher	teacher	active	\N	\N	\N	2026-08-26 18:08:58.249032+07	2026-08-26 18:08:58.249032+07	f	\N	1.0
3ee2ad72-7942-4374-9d13-ae801096bf97	\N	\N	Mailpit Test	mailpit-test-9bfd836f92@local.test	student	student	active	\N	\N	\N	2026-09-14 17:49:04.85673+07	2026-09-14 17:49:04.85673+07	f	\N	1.0
00000000-0000-0000-0000-000000000020	11111111-1111-1111-1111-111111111111	วิทยาลัยอาชีวศึกษา ตัวอย่าง	ครูพิมพ์	krupim@ktc.ac.th	teacher	teacher	active	\N	\N	\N	2026-09-16 10:13:29.118983+07	2026-09-16 13:37:31.303692+07	t	2026-09-16 13:37:31.303692+07	1.0
00000000-0000-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	วิทยาลัยอาชีวศึกษา ตัวอย่าง	นักเรียน ตัวอย่าง	student@local.test	student	student	active	\N	\N	\N	2026-08-26 18:08:58.249032+07	2026-09-16 13:41:28.690134+07	t	2026-09-16 13:41:28.690134+07	1.0
00000000-0000-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	วิทยาลัยอาชีวศึกษา ตัวอย่าง	Local Developer	admin@local.test	developer	developer	active	\N	\N	\N	2026-08-26 18:06:42.603683+07	2026-09-16 16:26:29.895413+07	t	2026-09-16 16:26:29.895413+07	1.0
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.schema_migrations (migration_name, applied_at) FROM stdin;
001_password_reset_tokens.sql	2026-09-14 17:43:03.037272+07
002_session_revocation.sql	2026-09-14 17:43:03.039761+07
003_certificates.sql	2026-09-14 17:43:03.041203+07
004_local_file_storage.sql	2026-09-14 17:43:03.04242+07
005_database_rate_limits.sql	2026-09-14 17:43:03.043385+07
006_audit_log_indexes.sql	2026-09-14 17:43:03.044858+07
007_tripo_jobs_and_certificate_history.sql	2026-09-14 17:43:03.050584+07
008_dashboard_performance_indexes.sql	2026-09-14 17:43:03.052063+07
009_vocab_and_session_update.sql	2026-09-14 17:43:03.053031+07
010_uploaded_assets.sql	2026-09-14 17:43:03.058268+07
011_clean_unused_vocab.sql	2026-09-16 10:14:13.169088+07
012_krupim_user_and_lesson_plan_week1.sql	2026-09-16 10:14:13.169088+07
013_week1_assignments_and_submissions.sql	2026-09-16 11:15:25.648438+07
014_stored_files_database_fallback.sql	2026-09-16 11:37:54.637453+07
015_assignments_lesson_plan_link.sql	2026-09-16 11:37:54.637453+07
016_rubric_and_returned_status.sql	2026-09-16 12:27:27.023081+07
017_pdpa_consent.sql	2026-09-16 12:46:05.788026+07
018_lesson_plan_week2.sql	2026-09-16 17:13:50.155097+07
019_lesson_plan_week3.sql	2026-09-16 17:34:09.974176+07
020_lesson_plan_week4.sql	2026-09-16 17:40:25.464733+07
021_lesson_plan_week5.sql	2026-09-16 17:42:58.075377+07
022_lesson_plan_week6.sql	2026-09-16 17:49:44.127166+07
023_lesson_plan_week7.sql	2026-09-16 17:56:50.973762+07
024_lesson_plan_week8.sql	2026-09-16 18:03:34.317063+07
025_lesson_plan_week9.sql	2026-09-16 18:05:59.826616+07
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.schools (id, name, address, contact, logo_url, created_at) FROM stdin;
11111111-1111-1111-1111-111111111111	วิทยาลัยอาชีวศึกษา ตัวอย่าง	กรุงเทพมหานคร	\N	\N	2026-08-26 18:06:42.176179+07
\.


--
-- Data for Name: simulation_scenarios; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.simulation_scenarios (id, unit_id, title, description, scenario_type, difficulty, max_score, time_limit_minutes, script_json, rubric_json, thumbnail_url, created_at) FROM stdin;
\.


--
-- Data for Name: simulation_sessions; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.simulation_sessions (id, student_id, scenario_id, score, max_score, duration_minutes, feedback_json, conversation_json, completed_at, lesson_plan_id) FROM stdin;
\.


--
-- Data for Name: stored_files; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.stored_files (id, owner_id, assignment_id, purpose, original_name, storage_name, mime_type, size_bytes, created_at, file_data) FROM stdin;
\.


--
-- Data for Name: student_assessments; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.student_assessments (id, student_id, assessment_id, score, knowledge_score, skills_score, attitude_score, competency_score, feedback, submitted_at, graded_by, rubric_level_k, rubric_level_s, rubric_level_a, rubric_level_c) FROM stdin;
\.


--
-- Data for Name: system_announcements; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.system_announcements (id, title, content, priority, tags, link_url, created_by, published_at, updated_at) FROM stdin;
30000000-0000-0000-0000-000000000001	ขอความร่วมมือครูผู้สอนเร่งการประเมิน Rubric	ขอแจ้งความร่วมมือให้ครูผู้สอนดำเนินการประเมินผลคะแนน Rubric ด้านคุณลักษณะของนักศึกษาให้เสร็จสิ้นภายในสัปดาห์นี้ เพื่อเตรียมออกใบรับรองสมรรถนะ FINE Model	urgent	{การประเมิน,คุณลักษณะ}	\N	\N	2026-06-28 08:30:00+07	2026-08-26 18:06:42.173484+07
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.system_settings (setting_key, value_json, updated_by, updated_at) FROM stdin;
general	{"schoolName": "วิทยาลัยอาชีวศึกษากรุงเทพ", "maintenance": false}	\N	2026-08-30 09:25:37.452142+07
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.units (id, course_id, title, title_en, description, order_index, thumbnail_url, ar_model_url, created_at) FROM stdin;
\.


--
-- Data for Name: uploaded_assets; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.uploaded_assets (id, file_name, mime_type, size_bytes, file_data, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: vocabulary_items; Type: TABLE DATA; Schema: public; Owner: 3designs
--

COPY public.vocabulary_items (id, name_en, name_th, category, category_th, pronounce, use_desc, sentence, glb_url, usdz_url, created_at, updated_at, image_url, created_by) FROM stdin;
a37e77e4-9e29-4812-b5cc-6edb126c4b44	Collins Glass	แก้วคอลลินส์	glassware	เครื่องแก้ว	/ˈkɑːlɪnz ɡlæs/	แก้วทรงสูงและเรียวยาว ใช้สำหรับเสิร์ฟค็อกเทลประเภท Collins เช่น Tom Collins รวมถึงเครื่องดื่มผสมและเครื่องดื่มที่มีโซดา	A Tom Collins is usually served in a Collins glass.	\N	\N	2026-09-09 06:28:41.374635+07	2026-09-09 06:28:41.374635+07	data:image/webp;base64,UklGRkYFAABXRUJQVlA4IDoFAAAQIgCdASqlAKEAPikUiEMhoSEQuzRgGAKEtIRIWwL2CD/xwdvaB6PwEBPdY3JOQINt6ZM7e7/1VDGICLDCHLVTMow2rM/lmCdhjQS5LERGeNmkK2NepCCj7NG8ghSfw2gpFq6qkuPsDi/RyudKXbGyc9YIkp8AD4eduaMEi/zDtggGl9cEJWXrAgQuhYpQbh5qoHZ0YROwchFCmvplyk9Bk70lqls1GSGNAlCqhBEUnjLN+eXqxDwPN7WtU3OsB7SCqiOp8FMNs+wBFaPS7hyHsIBUXKMnOrnXdJoN75fuEkTTK0jm8krxJzsCliR/kggd6xuz15oojUEeituIVkJM+1E6ctpOdX8o6UWWoS2U6n6f0uNkQMh60AD+8DCe5P0icW0FTrxn2yoElK+5ruMkghm9HTGO9N7xM2KRWsl1+XvwKFjxLWV/IU82ko0e9nf67/csYHZbpCXG6E2ZrKRZJbFdC65Ub1lEl9t5wWpvvvaoSYyp0QQn+m80dj29PQSMthArEUGlEVTycwUPtGtxBQfRRt8y/I1/4xrywf2gkHVG56eAc6n7Ngk5r0EqbV4TmldC98YHBR+yw+EpVuZJ0TQl4LxVQ+/iUsggdCFknBmTlyH+o0lhsb9lXDRcmXJyhxDU/A96nspk0wWMDIvw1PY6ftc49TTMfAYXxNehSnt8kyRaUQ3Q3inhJBcEYJesQKGxKY12zHlaQdU/M61xLiB7QjOhnLSnfhDChQIIr6yTeDvpylJerm0WXUqghBFNeKyTwzPmQOMjIjA5nePjK+zhnoSzfyKqn5w/E1aCHPuLZuphaT3StBCxhiXwK0adtcPtE5Y/cie8Ctbf9u0BQjDTF/hRCaX+fQmSekJTkZi4125X2dS0JQUmqINWN12mKC2aO4oa/1c+iDzRtxoIykGl8nVoaQ0ilredTMU3WdOrQNsJUKUidco0iBIk1Tmth2AN9zCBozIvJVlutU9QIkQ4nS4dkxO2rNYhZ1IWSB0TvdfGP1Kt0J1YF4lZgkKUdIu2Ap7fsC97U/IbTWQyO8Sfm+vcITKRxcKJDeRM3rfkzson8rJ9B8GY+vrw3+Lw68QErNfuwram5GD5rvV0ivaBb1wownRC8tFzgGsfR5OUgs75n3EvFB2ROdSa4Ml7i9j+xeHp1wuifeSHkgYKgEuWqr6tZEbgKzXpNM4+f5rKkLy1P2e6f36LzUN+ei1GzwaGKgKeInjdWRE9zdXRFt9Fmf1ilpWw16yIrLmlg4U38xyne6LfO5CKEjqKsrro3qewek18r5kR2s4XgnlzNFH6JZcROzSi9k9/b1KvpvISExHn0XZjLnFWzr15TZ3WZ793M3XwUEt5nAqF6/CN8iZnegxt4pe2S2Hm3iFsxUC0GqvZreHXBbscUfVRLpyJ1zX4oOIXR4ELV8MbqlT+sqSAq5N4pM5K9eO9kEqRMXWaQOitETn7OQGr2pZpIdYcdv4IvGHrbdiGSxGYMMSUWqR8iEdfJnnGU4TWhoXLx0J0wSmKFnQr1fExYmDp3v403ZPLsAym8tsUaj0hMwm365LkodwqrMV0sbdIYmwdb3N/N+/P8WVRe8c809vqhQRZYSdGXo4ATdtNx8Ii28BtykxTsPv02jEjl9OHLrr06EtPVPV44NC6RCzPzs5ZkwZ37meUy1wTjZ/rVf8mPCqQmJL69LgFIbvCh++GevxT18VQRG0Q/4Dp6Sxb8ahbgAsghNNzcrQ1Yc8FipUIg1SXrIF6Bcz2aU156TWCZN0kHlFmFfIUmmgAAAA=	\N
8b73825b-4d88-4475-8267-8735b3ec6c54	Champagne Coupe	แก้วแชมเปญคูเป้	glassware	เครื่องแก้ว	/ʃæmˈpeɪn kuːp/	แก้วแชมเปญทรงตื้น ปากกว้าง มีขา ใช้สำหรับเสิร์ฟแชมเปญ ค็อกเทล และเครื่องดื่มที่ต้องการนำเสนอในรูปแบบคลาสสิก	The champagne is served in a coupe glass.	\N	\N	2026-09-09 06:28:41.380699+07	2026-09-09 06:28:41.380699+07	data:image/webp;base64,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	\N
38710a16-fbb4-4b53-b922-5dd5500e28d8	Martini Glass	แก้วมาร์ตินี่	glassware	เครื่องแก้ว	/mɑːrˈtiːni ɡlæs/	แก้วก้านยาวที่มีปากกว้างและรูปทรงกรวย ใช้เสิร์ฟ Martini และค็อกเทลประเภทที่ไม่ใส่น้ำแข็งในแก้ว	Please serve the Martini in a martini glass.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.381037+07	data:image/webp;base64,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	\N
267ed0b0-289b-4549-a2ea-11db2bea9d58	Rock Glass	แก้วร็อก / แก้ววิสกี้	glassware	เครื่องแก้ว	/rɑːk ɡlæs/	แก้วทรงเตี้ย ปากกว้าง และก้นหนา ใช้เสิร์ฟวิสกี้ บรั่นดี และเครื่องดื่มประเภท Spirits แบบเพียวหรือใส่น้ำแข็ง	Please serve the whisky in a rock glass.	\N	\N	2026-09-09 06:28:41.381559+07	2026-09-09 06:28:41.381559+07	data:image/webp;base64,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	\N
6d238e0e-4ce4-44dc-a9c8-488668beed56	Margarita Glass	แก้วมาร์การิต้า	glassware	เครื่องแก้ว	/ˌmɑːrɡəˈriːtə ɡlæs/	แก้วก้านที่มีรูปทรงเป็นชั้นหรือปากกว้าง ใช้เสิร์ฟ Margarita และค็อกเทลที่มีลักษณะคล้ายกัน โดยมักตกแต่งขอบแก้วด้วยเกลือ	The Margarita is served in a margarita glass.	\N	\N	2026-09-09 06:28:41.381858+07	2026-09-09 06:28:41.381858+07	data:image/webp;base64,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	\N
c1aad10c-0b20-4ace-947d-5fc8ee828eee	Hurricane Glass	แก้วเฮอริเคน	glassware	เครื่องแก้ว	/ˈhɜːrɪkeɪn ɡlæs/	แก้วทรงสูงที่มีส่วนโค้งคล้ายตะเกียง ใช้เสิร์ฟค็อกเทลที่มีปริมาณมาก เช่น Hurricane และเครื่องดื่มผลไม้หรือเครื่องดื่มเขตร้อน	Please serve the tropical cocktail in a hurricane glass.	\N	\N	2026-09-09 06:28:41.400159+07	2026-09-09 06:28:41.400159+07	data:image/webp;base64,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	\N
57d2f56a-69f5-4077-9f65-8380bb45f170	Shot Glass	แก้วช็อต	glassware	เครื่องแก้ว	/ʃɑːt ɡlæs/	แก้วขนาดเล็ก ใช้สำหรับเสิร์ฟเครื่องดื่ม Spirits ในปริมาณเล็ก เช่น Tequila, Vodka หรือเครื่องดื่มสำหรับการดื่มแบบ Shot	Please pour the tequila into a shot glass.	\N	\N	2026-09-09 06:28:41.401017+07	2026-09-09 06:28:41.401017+07	data:image/webp;base64,UklGRuIEAABXRUJQVlA4INYEAACQIACdASqiAKEAPikUh0MhoQi90jwMAUJaW4WFozHW2tsHNjcVeoAB6uU/6dVoeoAfX7X5iV+ykeFN1fdLnqxhp/h2c40HS2Qo/6wRWUjYk/WWEfyvLkZhhdRyCu38DQCITRi+ZMMzBiMZIC8Sv/EIlOk8jrM77ArQdQr2tLSTQwMjuEc/uc4m+hiAKqK8hTtuWfyNnr7gsKcIGD2BqX7cI5bP0+zaNUR2dwwtgmzLmk6hLzkA1esxgkRiGfQ1IoZSGIImTJnhVSTmdGS2sl1JzQX+t12U0a6YXtN/aov8w849dU1tTq9mHVF+MN/f2dKgN9YN421lgJ2J0fJtT6owLhVLgsDAF2x2oM/OAAD+/OP5xe9yGfm6JvJFb3jJR6uxD7JDKnIpSMgb8vvSMEbEQhvoIvlUF8aw+wjE16Pr6y3El3x4ICbpbPqQmdY09Z2LMw7qXfxfhRjFjKaZcV6Ig2jb8JGEOHQZu0czO2i3tydeSji4P973gBxIuCaOU89Tvvyr5pdgZWNRmOGBNEeXej5wiCNjpwoiAHcuztVIlzToo5gV/Pmb07qH7Gb47mvbIxCvecH1ymBP0iIy465E7xxjyZ05sEj4uDT5HBc0USjj2DiBz/k45oEyfUK1GaLhATbuFIwf+wMKK6MwKh8VCy+5rHKOC+JOqx+GEYpXfXdyTaGuMJgejdk48EnM6IS0+aUr3KN6BBKME5tpgdFP5/+7kpKzYRE0e/XQp+7rvQaH5fHU/H4+rTaKzsr/H9Xvac4wR9w+c+1Lrh31D+nvX2CWJFBN1XB9IzB8A2U+4FaD+l2UbTEkZelRApLeQbxWiy+5Zns3Qu98VTlEbvfjtw1yI4CmpsO9jiLbHxatcpc4vKn9tbgQ7SebIeGjHO3BzOucIY4Mf56tlwukfPWQzZjO/9ZzxCXnO5yB7Mwsj+ShM/Pgr2l7GEK7oq6QypnazsikawXLyoVn0cp5z9TGKQRx9nDjsPwp6Z/eLOq7zRT/c/+/zuNeryfZjckrSrWy93InSZTeHpnRAynC+MNzJ5O5nYxorZE8M+i9VcQYrmbrBNDJruwVuyCrS6d2ZOmL1F1Et6SVorgW5KaIm9Duyg7UXhfGIDexWjcZqKQkicohBDE7P1UkigOKSAdqSq7noHjD0OW3jpuvnI+GW9sxnMn5OLdJLmQOcKdZ1Np/kkHr0dqNZi6ziTdUcMlWfNhtmrxVTfE7pmibO8Ma2Wg3jAqlvWKXffLMTaYja5UMN0OsZzsBGumuBaI7I5oP8JUPkXpTHkrreI4iWypyWSo5n2nP5btrmGBEaYlSFEzn1eRs+L4Tpjkp8xJ+WKIitdi62xQPYz0+SszgdU2DXA6Ik3xNGXGIN4Mms6M/X12uYJAAcg5dacM+CVICjtOUa5aLtxw0Ekj2Y6ayG0+wksdGIxL9B1t7zC2f9XMH1Wi9z3b2KqYC1ULcBVN+bdwVI5szih9n2nOTmQjuDAVL0aruOHuoxvokAW8UtStU5cJLhQgth4MasyZNc38OaLNHwcctK3uoXikfRQEhQMI3Ehgx+20B0+sI2V3BFta+JWivatWDFNuXlBAzWxdTVAaehJ1h0NhgWe0X43VApFIpdk+Rg7QhbTqotIMwAOZRPitXeCmIIr0AAA==	\N
ff277b79-abb3-4218-8dc7-a975f27b0918	Beer Pilsner Glass	แก้วเบียร์พิลส์เนอร์	glassware	เครื่องแก้ว	/bɪr ˈpɪlsnər ɡlæs/	แก้วเบียร์ทรงสูงและเรียว ใช้เสิร์ฟเบียร์ประเภท Pilsner และ Lager ช่วยให้เห็นสีของเบียร์และรักษาชั้นฟอง	Please serve the Pilsner beer in a Pilsner glass.	\N	\N	2026-09-09 06:28:41.401327+07	2026-09-09 06:28:41.401327+07	data:image/webp;base64,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	\N
baf5bdaa-5f4f-4ca5-bc9f-352ac63dba38	Beer Mug	แก้วเบียร์มีหูจับ	glassware	เครื่องแก้ว	/bɪr mʌɡ/	แก้วเบียร์ที่มีหูจับ ใช้สำหรับเสิร์ฟเบียร์หลายประเภท โดยเฉพาะเบียร์ที่เสิร์ฟในปริมาณมากและเหมาะกับการถือด้วยมือจับ	Please serve the beer in a beer mug.	\N	\N	2026-09-09 06:28:41.401657+07	2026-09-09 06:28:41.401657+07	data:image/webp;base64,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	\N
66100a75-8528-43a5-b128-828a45dbcd23	Irish Coffee Glass	แก้วไอริชคอฟฟี่	glassware	เครื่องแก้ว	/ˌaɪrɪʃ ˈkɔːfi ɡlæs/	แก้วใสทนความร้อน มีหูจับและก้าน ใช้เสิร์ฟ Irish Coffee และเครื่องดื่มกาแฟร้อนที่ต้องการให้เห็นชั้นของเครื่องดื่ม	Please serve the Irish coffee in an Irish coffee glass.	\N	\N	2026-09-09 06:28:41.404101+07	2026-09-09 06:28:41.404101+07	data:image/webp;base64,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	\N
8e1fca52-61bf-4368-ade6-c5405d8e9a86	Salad Bowl	ชามสลัด	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈsæləd boʊl/	ชามสำหรับเสิร์ฟสลัด ผัก หรืออาหารประเภทคลุกเคล้า	The salad bowl is placed in the center of the table.	\N	\N	2026-09-09 07:04:33.559316+07	2026-09-09 07:04:33.559316+07	data:image/webp;base64,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	\N
0c3eb694-5398-4b63-abb9-0fdc9199a847	Bouillon Cup (Broth Bowl)	ถ้วยน้ำซุป (ชามน้ำซุป)	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈbuːjɒn kʌp/	ถ้วยมีหูจับสำหรับเสิร์ฟน้ำซุป น้ำแกง หรือซุปใส สามารถถือรับประทานได้สะดวก	The bouillon cup is used to serve clear broth.	\N	\N	2026-09-09 07:04:33.560627+07	2026-09-09 07:04:33.560627+07	data:image/webp;base64,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	\N
28adb19c-1005-44d3-ad94-f63784b4de76	Ramekin	ถ้วยราเมคิน / ถ้วยอบขนาดเล็ก	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈræməkɪn/	ถ้วยขนาดเล็กสำหรับใส่ซอส เครื่องปรุง ของหวาน หรืออาหารที่ต้องนำเข้าอบ	The sauce is served in a small ramekin.	\N	\N	2026-09-09 07:04:33.561173+07	2026-09-09 07:04:33.561173+07	data:image/webp;base64,UklGRpAFAABXRUJQVlA4IIQFAABQJQCdASqlAIEAPikSh0KhoQoGPp4MAUJaRLgFqQv3p3t076DH/FfanKETVbsbXFe/99byoMZHyigQjKwJQB/0jpnotOyuqP2J9zMUhv7okZgnaN8dUlfQ9Ii/y/n7gTew3x1yfbmkm4o2DUfHgynLwAxWOvE42R/j5gowmJKiLrVBC2/CjUhq8hD4TfZkBZskbwt2y76KU0lllNRNWDNXPadtqyIK58ANwZUNKtoI5NFKaLtMQbsXXbbxobx3PEac+Ap9WWJ5mWfbtID6Kr17jdYlT7YBw2eP5j/cc06bDE/VgyH6rfh6g+FXyBA8mmFWcloKuTKv/K7ZeevbMeW79c8lFnMW9AEb9O4MKagO0gf7+cViCgCGOA2N8aWTLnbHgzOXLF4A0AhEvPIAdsm5n9oAAP79T7p2FIix0DTGb8VUUSvE50EOjkofxmPJrQowyKAIMNrsXQlNe39xMspwoEFG14Hsy3UHkyke/K3fmpYrGqOZROAmTh0rD0SWZ2ML3bISpxAi0g3+daDtjKbwy/tKXQleB6zKXCp8l08c9P0hqWMSyYZXZ6odmy9jjtcDlnBhpJn3X9aM7d4cl6gvtZ5Vdo3j8ugylCD44c6IZ0vhqdOxkA3njPKsDTwTyGE1xatBWZ3LD9wx/5utTdzXT3IkjXnt3VSdnm4U1joq7akvvYqi9HlVvSRivFl+mBSPkMq2Ir0mLHN5Bg2Ugou7KZZB1QvalfYWzJ7dTma/0thmwFOX/VziI1/YwQVmU5DYeZepfr92XzeUa8tTARg+tDpkUvj5BzmclaoSftwArIo0WXRoPo/g9WvxN/IYV9xf7rU7boPUqmhaKY1FOgSzG7Oh5zT0xTEOOsvvsrI/HU3z9oRgeIlMqYVYD33BlohcfbixlLkBd/7EOPzY2VlCWz0nqLhtRlNLJYbDMYrim9H1iJRV2j+mI8JBUTyfJ26LYOaZ9P2pBSos7nhs86rjXfPhxZfXBzjOrmRWvpWIzeIG+U0wldnrYFHFh1JlaOChl6zX23fg7vIMIX289wyEND37XE6wWDfOTrnXcLGSpMukbH4JSJURyKR01VS1hoXHA85ymFUF1CvJg8nqke7udI9hXywyH0YfONcj4plYmJCMauhXS6E3q82jdUdWyKF2r9VZf6Ita48bccScsAdEcm5kK9m/c1aOhvqmlRFudeBehazkeYy3Ji+rFIXmvnJV4URIZI4pOHtL9LT+bS8W0UB2td2p/sHrrQVIhspteHwUWUYsN1R4N0b0NSsPKask/DW2vy0/+gYTL9E89jLZomoDJdO3x+vOyt3sS7NGYbdW7Psfnc2mFZskYiQBEJH3tSgHzjcgK1GMleGP3CEXRvuPUbwoYiEIC9LYrBG6PICKgtungNCsBZ++WZqKQqX64Ea5PLZINycY3oowwGe6QWD4/rl44x+sayNIabVPj7PJIve2r9FW5V0hlTeQJFeZBNcZCoROQwvi8n3Q+OOAJoyrzDfPeTB+lZ43sV6ii3amCQibLg35XkR/yK5IbEeAsWCVRi/+WC5XCLV5Sua+YUYr3BvQnczTI2ENbfOZp0z83r2SEpzOkSH+Bia32JJmQwh0EhnRMAyBeliaYvDx7SylT5FG+/Lv6+orUqk2cGU8sxoX3GRqxk/YJRHZ54ORs3DC7HpVvV4zwYU7/lU4C9JkkfpnNXCwVawDDm3BPkokO+L6uO6NL5JGXXed3yMubSb6m0WgcP5Y0t7ip9T0wncAHiWFyUPhCU/OIJpW0cdq4kZx2TwvvMs8GYL2Bskj9nLAllj+NHKm2D156bRJArFmGgtpQlPZtP1BApmaW1KHvonAgm7YnxqDwnMymsVpyx7Z9nhXK+wEI7Il3iAkAAAAAA==	\N
264aa943-86f3-41b8-93cc-2d5e3830b1c9	Finger Bowl	ถ้วยล้างปลายนิ้ว	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈfɪŋɡər boʊl/	ถ้วยขนาดเล็กที่ใส่น้ำสำหรับล้างปลายนิ้วบนโต๊ะอาหาร โดยเฉพาะในการรับประทานอาหารที่ใช้มือ	The finger bowl is placed on the table after the meal.	\N	\N	2026-09-09 07:04:33.561616+07	2026-09-09 07:04:33.561616+07	data:image/webp;base64,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	\N
a2b257ca-22b6-4fa6-8efb-d4516af7c448	Espresso Cup (Demitasse Cup)	ถ้วยเอสเปรสโซ (ถ้วยเดอมิตาส)	tableware	เครื่องใช้บนโต๊ะอาหาร	/eˈspresoʊ kʌp/	ถ้วยขนาดเล็กสำหรับเสิร์ฟกาแฟเอสเปรสโซหรือกาแฟเข้มข้นในปริมาณน้อย	The espresso is served in a small espresso cup.	\N	\N	2026-09-09 07:04:33.563805+07	2026-09-09 07:04:33.563805+07	data:image/webp;base64,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	\N
8731b2c0-264e-4f7f-8e30-a4e40bbb9f82	Cappuccino Cup	ถ้วยคาปูชิโน	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˌkæpəˈtʃiːnoʊ kʌp/	ถ้วยสำหรับเสิร์ฟกาแฟคาปูชิโน โดยมีขนาดใหญ่กว่าถ้วยเอสเปรสโซ	The cappuccino is served in a cappuccino cup.	\N	\N	2026-09-09 07:04:33.564148+07	2026-09-09 07:04:33.564148+07	data:image/webp;base64,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	\N
065d6ca0-f24e-4a41-91e7-355b523d47d6	Mug	แก้วมัค / ถ้วยมีหู	tableware	เครื่องใช้บนโต๊ะอาหาร	/mʌɡ/	แก้วหรือถ้วยขนาดค่อนข้างใหญ่ที่มีหูจับ สำหรับเสิร์ฟกาแฟ ชา หรือเครื่องดื่มร้อนและเย็น	He drinks coffee from a large mug.	\N	\N	2026-09-09 07:04:33.565091+07	2026-09-09 07:04:33.565091+07	data:image/webp;base64,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	\N
a9a095f8-4df1-468d-b92e-e0f422c25614	Serving Platter (Oval Platter)	จานเสิร์ฟอาหาร (จานเสิร์ฟทรงรี)	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈsɜːrvɪŋ ˈplætər/	จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟอาหารหลายชนิด โดยเฉพาะอาหารที่ต้องเสิร์ฟเป็นชุด	The roast chicken is served on an oval platter.	\N	\N	2026-09-09 07:04:33.565717+07	2026-09-09 07:04:33.565717+07	data:image/webp;base64,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	\N
2a8f7600-1cf3-4b28-9f46-019a83f5f505	Serving Platter (Meat Platter)	จานเสิร์ฟอาหาร (จานเสิร์ฟเนื้อ)	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈsɜːrvɪŋ ˈplætər/	จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟเนื้อสัตว์ อาหารจานหลัก หรืออาหารที่หั่นเป็นชิ้น	The sliced meat is arranged on the meat platter.	\N	\N	2026-09-09 07:04:33.566282+07	2026-09-09 07:04:33.566282+07	data:image/webp;base64,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	\N
97a31960-d1be-4bca-a197-54705162237d	Soup Tureen	หม้อซุปสำหรับเสิร์ฟ	tableware	เครื่องใช้บนโต๊ะอาหาร	/suːp təˈriːn/	ภาชนะขนาดใหญ่สำหรับใส่และเสิร์ฟซุปหรืออาหารประเภทน้ำให้กับผู้รับประทานหลายคน มักมีฝาปิดและหูจับ	The soup is served from a large soup tureen.	\N	\N	2026-09-09 07:04:33.566632+07	2026-09-09 07:04:33.566632+07	data:image/webp;base64,UklGRlQLAABXRUJQVlA4IEgLAABQOACdASqmAIcAPikSh0KhoQl1HvAMAUJaS+9yoT0Hnvp1jpeLb6Lj/fh64m9MdCTEfaX1b+DM1G5//a/SImrfirGYaz5Kv2r1Felj6ORZ2oW5y5KJpJ+vtt+AcRqY6zwwDSRduFbmHZtQceCOKHiGaLDHG8aBuHaPmPYqMNMQOO1KLdLyN65oz7Ou4mukgko7CF1DUDy3PYJcOK4wuPke1VjtpSiumRHJyj8fJLh4WdmxjURN+/DkHlDDE1G71PyKajQbm7T9k68CAtwXiHKkZFQpTwWCCqLNWcjou2gt5wzfvj1Im+4ZWNti8CbWCVNSaZMBHxNueR/gSIFvph0UJh6MixhzBaghv1npoNu6n7TIy8eKGlWaloXupAFO+ccjq2zssl1iYehyVSzczZR420b4rP1PJQbMZ9HXHey1067zwzpX7SpUWW2jwCe6sP46Ncf6RE3tChxJc/QLIhNqIsewDf6+XuhUX371sbF+juKVQnRaw1pRS4Mw22cE2uYoxPdAMZfTG8ArBWJg3ALAq0ty82df8rdhxVdqLAJ7a7zU531nPlh/vxteYgqMnlJxUeX7yrhzIiFp4Y6D6oPaR0Gyz0AnbJ2UHyAA/v+sv8oFz99A4hvqHMNKe7qXnzbf/j2al/yqc0n0l9fKtD/iD0SCNbZ4LfYoS/LpnvydqtNLGGcOhomdoGXaCEA2XtkoYazHTpfUezQAKvdcx1kdAqIwSF/oLi2KA6H9houPu/YW78p4+P8f5Yf63685B8LOx9tFnnmuDaQmvkN/hph+f2rAbk4g0DAJwTKqszAFDxSSF9rtBegBpJdk3wpLmS18xH/YdVR+Yr7s15MGzJtO/2D2/aVsh/mA4vx0JmZKuAiOWQxxmfzs5XGBZwVTCCePFPjpg6vZRrSVF0X1XwtoA9dmy1LttNNbfDoVbisstCEAHUAmBlauBFhX26nJcdyqSEu01Cu8R64aHBc0ZJxmYJUsPVYfCYEh1IWUMuduubNHg6sRgNCebOcZxCOt1+XVKgLjyhYq2zNTw8b8pVFNSP16URcjy7u6V7FuDJ7mUyRNHh/WOgdzI90JDqlWd7jCR7iRqfRRR31vjstxOQDHyzRYoB/yOZJ+2/KHNjXc5Fd7cd0/gI+rdRrLYSTdHSPMlp7BhnTHxLCXyVXT2uPXgtwLE6liSQThmvy+kSp4HZj0NyqP1HgkFpf0p4q9VFnjBkQONYrXz+R+iWQ+PgN+t1vqvqDH3se21rTegVqoGh/vPyIQau41lgwB0ldx58X8KWRF9XB3eixB7XXqDkHPfglzL+z9yXnycNzU6XcG7DAQCQBfzjDw+cmGPjrf70HTGwt0kl/RETXUTdvzmrir8eS4sfFrcwzTzdoL18Y5t4lJfSbOePpFJZWRQn5HRJBCc0256mBId19R/YPQz2HUS/qGgGcAm8PqH+pa4MO81kZ+ep3bJtsFPgTGUYjGcGOaBmpcSFvu3ZPxu/dLArayGhZhER1sY77TVDe2jVbUC24ChFhgzWUydGJocKgphIdZTqYzDCCPazbZowoPJVOeIKriBxKKymR8CXOu4OBH1/7LOfqOTdb8OP/JQtD3aPd0/s0W8IJdf7DlJfvz1fI6xfct0aMEkxjhjzgVdsdtf6xM3ueCBdDgRfEHoS2U3OLyHbYawZBcbaed7MnypVQ02YvvAK1r0W0gLdTYVAAK9NiDA60FSc++7t+uoeGbcAhJ0xHqt9eeLcMgAOdWx7LWa3am+sUQm6xd0FVu4CwXp3AyE4oShBm2e0mFV5tONvdmStKrbX3kOdxx0ESHyXGSYBQx9SlDxE09ioCcYSMhIP8uP+i+fVqlBuUW4sD+FaRMXGRzhRFAPaDONeH1awFz0jYkpU5GOKFrBkbJBOib5Wsz98VYVSY1oouGkemfUbChp6mK7kLgP/UWcWcsm7rt9iFASC5gM9baYw+K143kO1TUdNaUmC5skxEQp7y9o4YjpsDwZVZpKJnLFZkF4+y4IPqfBgUqjSFvmzS9i56n68zTQUr0+tNyUQFDehNeC/8kYPM24JJScpqrarNoE51tOGdqpMTL/6isH7sepS7ZL5y1tnUQTIgsq4YJFc08/QkcC3yBz9/tVuuO++mXCpZriUv7lGzgTMTC/lOb4eSzWkfNuWAkUrtvJy9r5v83Vmv8pgHL/g8xUfZ2a93wWup7ldNKQtzlRO6Xy6hhtUC7Ark37NXW5qpaNhlWeTtJPJMoxI7+53ivKfNqCkwLP1Nm+D9K1BPBeJYxl5/ClboX2jzc+OcN8m+zYv5psNgPqu3A1fNTjDBlX6hVj9nEd+ju1/glrwgBNXmPhYyIpCG+eZc9opTeDtgfbbHDyvwiEV9GDKON2EPJTx+EoGA3XzsbzD3CO90d3taqskZE95of1vgfd9o6l9BX6X/+OuLHy1Qs+YGqGUDzLanVWebhAzJzasH5uVWDBWUT0gjcHutY+HBqZssSDkHZIItAlVs/OcFua7AvrqAAIULjLv27U0lQ2/t6/CuanUVFLvuhob1X6RH/2S5QuycfkLNi5DlJZQJBNZBteGyIDEoWFB8kPg39tS7a59iOAPsqBbCdBWEkDTClv3yUAAirG5GhmygyVkCk/HKBz7Js9ICk8GCq/BBdb7Q19ELdNbmD/Sy7HdcZ0G3Eg0GF17XOMD2+hQA4JlGW+SoNx9XkQBugT/b3d1v10uT7RlGMyvN+XSB5MFAdAYI858h4RVgme5VfPmHi2QihIajacnjd2bnYnbbrQziQHUh0XU4TddN6GgkBWu0Cj9oKyq3fwCxWBGvXgbPSlymvwcXE1uMVwoXVoFK+bfopAEhmaciZ7tkmLlvZb84bbYTxMjN3v+7zkLCzqb5OitO50RrLda3IabL9qcZuE6hrvZcDxJnVQyyjBG5n+ue1GZizKQDVVaXQeB27AZkyJUs6pQoZUXSu3m2GMrF/qXw1wQor+Hd7X0yOIDTdxJ+02FIHqwcJUti6UP1VBM/DsSQNIZ+zOW3/1ANgHwaRArWfWV75959H+/laH7GT4Yrq1vIbgIs0dgiACiC94lsAuykrJthiJht/fsklEi9jqkZtcKCTSdhr77CyIO8B/ngk+RYGBzvSiWGcRHu17NjDmFFmRHHBvlh4+JRUIqPxOY3KMAaGxpBrs5c/8IhCANpZLJn9Amni2udm3xoji4o5+aEV7URiNk5jabXXAXMf1II9kv3CUTobHvDtipW1aCuaD43AyRRSn1C855sXwGaSRgLXmB7/agKmMDhYRVGo6oQ3Uvx91ZqZSw5xO8F4VnlWdzJBCX7nzjuBkIgaBnGxONe4U3xwx96ALBertsBkPLVxMfO92XicbLuInjaPArTFk4r3MnbELrxZuAGOTumpKTXiGP7YYWqNegjsyXZu5VhfQEbdHrFh9uDLkwpD9f4+DKFbA4EmqdKNDGC08VDQdzQZ+ois4Unpeq1zcrC5qPDZKoB3p2MSQvop59CSAOYRM0gHYmPlRbEivTjKpUwxl1OpUgKj3HkdJLJf3QWPVMF5VeReD7/UUVWfkrHuWvgyJ5lmG8qlb7qO0dVnNpzvGBJ/A/1D6ru+waxGvGkCSn/JDGlDOZmjxwSrf5ijDysEoEeudRoVBM7I32/c4YYbZPMXkd92CiuKP+h6NMa1ctve0OEuMN1MkkZpWnoDnkc/ADNtLf7Z+Iu/6vDBRl6Y4d8qsR7OClEjvVi2KL8vAbF7a1og2bSgGtGWWP8YAEL1OblIxWDN0zuglef4zPCEnq2tsqbz6DpQoA9xVC1rAJuSd8FiLY40pHSl3KhEdoB12T60HDt7jiJf5uowrZoskbqdG92YiMAAAA==	\N
ffa9f70d-53d4-4ef2-a28d-ac1f8c21ae44	Soup Tureen (Open with Ladle)	หม้อซุปสำหรับเสิร์ฟ (แบบเปิดพร้อมกระบวย)	tableware	เครื่องใช้บนโต๊ะอาหาร	/suːp təˈriːn/	ภาชนะขนาดใหญ่สำหรับเสิร์ฟซุปหรืออาหารประเภทน้ำ โดยเปิดฝาและใช้กระบวยตักแบ่งให้ผู้รับประทาน	The soup tureen is open and ready to serve with a ladle.	\N	\N	2026-09-09 07:04:33.566927+07	2026-09-09 07:04:33.566927+07	data:image/webp;base64,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	\N
2fe24673-a15a-4f3e-b8b3-41fbd8531ba2	Oyster Fork	ส้อมหอยนางรม	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈɔɪstər fɔːrk/	ส้อมขนาดเล็กสำหรับรับประทานหอยนางรมและอาหารทะเลประเภทต่าง ๆ	The oyster fork is used to eat oysters.	\N	\N	2026-09-10 07:16:52.267985+07	2026-09-10 07:16:52.267985+07	data:image/webp;base64,UklGRtoEAABXRUJQVlA4IM4EAABQHQCdASqoAJkAPikSiEMhoSETiQRIGAKEtIHYDzuQl/cOhZ90UXqUv8jYP2PHVTvLuRZjV9aD/J8sJT9+EFFDUYueXIEdcpN9+h60Wgi3wDj6OhUKMZTZyBn8j0VKD6BkuIjkwI47OqORB/SwEX5e86j7VhDUDVMfPxGwhCVv5cW96QM83rxE10ERBRmE+eW39Y6KIw9r7i3dvdh6fZ7wd5MDtHctO0QW4JdBx4/PLRucgb1HGgFVSQyv3VK4LFZt4YJE5l+90G3kb6CfUzHdgTkj58uyI7ARbwO8xP//H2giErokzhVZFJgDUVmjadzD+QAA/v1tGWpNVLm27555tD1WekTUpcOdtc5gBlZxgn8RS0qDBN/Z90i/SFWW9wnyEe6R/HCS6BUmT7R1b/I6G8RMACBHAMMtRE+O0SZwPCfLuPfH5Ayk/dfzOXP84Mimd+6xt8EbMo4Kl5DMvSwRZZJX/cQ/gAx/9WmIJqHW5lT+y/V8jwLA5eCFuOKwFJ/vgbCoA+w3/vl/sMyXp5cNJZosr4Nm+8zz+dyEkcLzlU/q0ItP4F4upsCf+e8SgUwocv2F5JPX8FumPXy/8oS7ky881OpUqOQIS/NcLeO52n6wjXQueSY8PgnjXYik86HUo1pg1sfjj4DSIwjGj1tkOnYK+iZTtTAzN0vJ3B9jXt2msCfKG5E9eQx34O8rKhFZNVAfrJybqQMh4Z5mZZWRz6UIhLje9+xFGzi0qq2VomhWrflTT2E3VeVF0SnWS7QhDGcOvFqDCzWTuVR7ffEDVwKbllqzjBQhJfcdqVjwox6Nci68l3cdfsClJi/VMvbotfyWT+wmgsTj5dWCbtHpGczM2xC73e2RHgNrGHsVTEXpwG3SsBQBko86nw2gTxVxdAQyYBx6an7owC2sQIOznjoIyHonGonxiWY8ALisPeZQejdiwBa8Gvq4kTRBz+FEpKTYj+JjXJ1iaeEf2CjBGF/ksQGar/iLVNK54jD/8HCaIEKGf4z1pgTJWMU7v4q/Mj92feX9QQLFMkcld4mT8irgHcSYteBQ9qyZ7hANel1c7xpWrriTNJKbfSlIuAcrRLJlsgw+YjhKcGX6sFF8MZ+NdGuDI5W3nCBgGfNdREx9Fy67lxdbo4alBhkIyghw6xCz651+7JCk0KXxAb3Uri3l3zKwFyWzgLCYvQO7W+oAW439hj66H+/t0g3xiA/BX1qk3YVw9Z9tJpUf1RXQD8ZGulH0kitOl13GkMeDezgJb0t1FQQeVkCWtk14MnCfrnMPgsceOzUuEUTpIGx9KGerbFeGBdFkMYH7UYbRELzjprvQx4ec66o7wSqW9U7r7QnfmOpHLsLtIZ/DRoPeOu0+kqqgX9AU4py0WO6OypnPm9bWGhHFDdn6zcvU5q+2WGrpjz8rlozfztc4L1MkdQ2XiNFoVkhf0My3paXDh90LWv9JyxzgkAQ1iaS5bdkKyc6UgSuoXNyZG+eZ2LaUcLEwhaD4hC3sDJgN5hLF7gKm1QAuGFcZQHzt4cHeduFWK+kPkrIW0AsoGMQlEsDM1n8CKynMwOO+ctB/zpBj4lI4tG8qAgzIBTvdZtMYcP4SZdLlYkt001F4N5aS9bjBfgqfFWwWyh/miOIAAAA=	\N
0e4f7cab-c06b-403d-a574-4a5115ec008c	Snail Fork	ส้อมสำหรับรับประทานหอยทาก	cutlery	เครื่องใช้บนโต๊ะอาหาร	/sneɪl fɔːrk/	ส้อมขนาดเล็กปลายแหลม ใช้สำหรับคีบหรือดึงเนื้อหอยทากออกจากเปลือก	The waiter brought a snail fork with the dish.	\N	\N	2026-09-10 07:16:52.285787+07	2026-09-10 07:16:52.285787+07	data:image/webp;base64,UklGRmoEAABXRUJQVlA4IF4EAACQGwCdASqhAJkAPikUiUMhoSESPmQgGAKEtIHYD0ha/9DfotnAfT2PMJw36/1Cit3M8pL0e8UT55/p/Nv6zX96GAFuv2JobuSpi5uNzKxBLN1MKcNctQ/njDNLg92hXJUp3bylQ3RRVq3io5tBY0Nl4zyBIwJB2zj17YH/wwbGzm/PMwt+N0itH05GAcZh94jO1TfqtQfIStLPxzrHzkY8UCDSaAEqu1FSS303dRHRG8D6waHA3iJH9u0jsu4uzDcPr3S60ys4LCH44Kcr895kT0djvKc3SbTSQILi9zv8Ewyh3ipAAP79Dfm7pvJ/8m2Gh7Mj2EAf7Tp8CBJMvvq5Y6Oo3O8vbbn5s+mCjaa+AGH75LvdXijMCZrV2PfqYN8fj/4Xjz/0fLtN2g0SA3CeP/6nx+/zGZIkzzCsDbm6GHxBzaSvhZqyQU/zHn+L5YZhixCVKt97LsH2nGDUaeHII9+Gocf/4M7mv+fJSPxvDwicz90du7N3xiJWoun9D0x9r/mfj6fOsZqpt5j7YuPXLjL/204MxCe8hq+mdhMV8jSYLWWynVR7Wx8rAijSe9tw48JIUvbb+8MgFVm2mtMK+OJ5HiJ+g9+4/EKie276YolNKJmPmfylQHNbe707Zk4pAqZYuN5NZrHEyYgl750nCWpXsfif/rfktwLqP65E5g4KFbwTRisuwSc51iYGLKzPhKP7qZb1h1EjOEo2A4Y2EO2xjkiIZEnROkz8fp0cTlDHPqd+XnYqNMm/I3sFaGgK347ZNhnBelzamRW7zC8cubJf8ZgTlUemQaiexemsTMvMFeHu487U8++ZWdc9IPwBjXWJX7tiZQRDwPoaLIDalL7oUk7aYiRnbLbYwSTfAe5p8Eyc3uJUNaijojHHNWtEBLnFzWn/JeOE3kpR1fSpZ8EpngJjMqy9jshtNg87gioPoEqZAExDMkWWcVbdfnAnKCkA0RubqEUkE4WzAirOm5N7aohN0yDR5lsGEh7Dr7vNuRXlk4Ork9OCN9wLiimTWFsMvl90bQ42k++xsoKHZQiRw5P5Ly3SHBNFKgwn5/p1lth5XII5wydxPCjlufSyWsA70/U8KBSkSx08uPliI4kldeibB5rYt46KoG/DZNcbgiF3oqwCdwN8m1Vxi8ANADh1+imqyPBmK6/gxIa95vM7blzG/fmvyJiAIZZJX9ZWofLrgyI6EM7rcHe/Z5DDXJCv/i3WqW9VIrm2loqLLNDPdRP2KZL/eYVSgaRgY4LwuUBL+33nJraskhv6Ucy9AzwgMah/FMyxVjYIKPOqYI0fq991hm7i3SjHw2NgocB/IfSrbyfinqazqN81kkS5BxXQ/Tq7MVAH+uxBc7zNoAX2wpzRtjIpBpe/qTIy0UKqkn1tVU5aw1QeTbgr3iYwXqy9c5q7bK4X62dqgZmsx1ES7FczK508MWCJBjomcMpcHBFPP9v0s6Ipv7gEgr2tV7eFVZ3CgoyAxBAAAA==	\N
29424f37-73a0-46a8-807f-4a9cc9e8d033	Fruit Fork	ส้อมผลไม้	cutlery	เครื่องใช้บนโต๊ะอาหาร	/fruːt fɔːrk/	ส้อมขนาดเล็กสำหรับรับประทานผลไม้และของว่าง	Use the fruit fork to pick up the pieces of fruit.	\N	\N	2026-09-10 07:16:52.286495+07	2026-09-10 07:16:52.286495+07	data:image/webp;base64,UklGRsgEAABXRUJQVlA4ILwEAABwHgCdASqmAJsAPikUh0KhoQnFgioMAUJaW5CQBQ5ryc2Ch757/xZbebg+w9gFy+fR05Hxnzyf8z2mv8DvlBDqCYGoV+OAq5HY0/G4D1LC24E3XSKBEJwmcClnflRlp8MbOJsJaeXcdoIUJdatiQNF2iyYZvwn/XlHb0HHkSgjbR1S1dqDbzhlSu+97Xqbz2lv6+JfoH8IHWLnIqOk/DEMlBWwU18VJt15F8WRnFqw78ncujaL8q0MLAppph9AdqH4sB3IvnHPvtUbhQm2Xq7Ku2VDWWz1coJapWjXLEx5YMpQgm3jeROxcEhg2cwEGBOLVuUmi5PQcCVROagA/v0IESkP4n9zEKDX9mnL21+I56fz/JD23MY5hOtN6H5Sj7zI6/+Q0qe1OC4IcuPbYFaHMEtTTnWWSxorCIS1+kNkbYSE9vBm1vvimM0YvGv77GubucCRkco9f/6F39/+ibEN8fLQEJchV0ODb1FCcRQ10ANHxo6pqUDb+TYAu1gl0qeT8THp0I9dXvJthfiGqz76znJemJlICLLZpiOfbadc9cijCXwybOj6lvbPVQ4HHe7Miv2sTxFjCP/SkZXKP2GES72vhXppbVFxneOoai5uoT/NUZF6I2Et2dopEnaGQQQ53EswOT0MHoyim/GWfaolJ52zh50ilsb6i+JgENJcxqZRdHzlu2u7HaCwtObnYgWvI2xREEXBTWVaE02pHjkLuWh5SwUd+KIlxu9x27x0U5XZeiEY2eF18N/3H5guZdZ3qfOZO0RumMqDnW1SuBl92pDeAFjdg51utpm/TT35PlZw1PlcPlk1BHNMDSytToUOURr6qXclZ2d+MpQVzMyJRwhDT2SiYD9kXgZVJndsUuzctV2jQNoUwLSr06IvCvxNkwVAoD+DQ6Vo57di13AsUpFW8Gfv5PM4mSUGD7XDjDYyKxN3SpQuT9a7C/A7pqjvvaUSh90qhTidQ12DMb9kuGN2UT9vzJHMCfgMjwitT0TlRRyGERvDE2nIImUwOXAOsZea6oAvCCtxS80wGeLP69aJwDE75qS8490rhwo7dFICa0ath4nNM8NaT20ID9UPqPWd/QPXSah4F6MmXgsD9G3W6oJNDmMffFhqViFb7SZQQd3OCCLUN0C77gtEzqsvkAsfzm8yGmIUSoHVqRfEiFQPDvNcUD8vanYat68OkRJrnGl0u2DC8JjsCNArJabZPIzHl2DPaGFqD58bkFdjMtNZuEKm1YjIjVEdLZmW0judORR8j45jneo8wJvmKZfut6KQikblUHFI2PV9f/UDg/36/QVBOxj1bTtVZVngKMrIqOGaAqiPNpxog3T13X/lXLUw+VBjSP4h1gTHZCPVvzmQ4nZPKHji9cCiWt7JuzadT7CNLqxTUdQ1lJNebJbs8pBmwcX700CagKgNI9vG/piLuDP1SDwH6I+ztYo15A/HE+wMKkORFwpesPvOyB4vMcc6Sjxviy4AA7myHxWCyqwSGwZVyoH6uMm3TgPUwQ/OO15UE5d8kyLrwtcQH/34MJFSf8X12tbIKk5lOxbnj6HclqzKWD9DMYAIYaPJwm8BjchwbNdfP1Dl9XM3Op/tSTmbLFqBmRgAAAA=	\N
076fb720-acdd-48ce-b5ed-8b512390b4c3	Dinner Knife	มีดรับประทานอาหาร	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈdɪnər naɪf/	มีดมาตรฐานสำหรับใช้ตัดและรับประทานอาหารในมื้อหลัก	The dinner knife is placed on the right side of the plate.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.287615+07	data:image/webp;base64,UklGRiwEAABXRUJQVlA4ICAEAAAwHACdASqoAJsAPikUiEMhoSETWhwwGAKEtIRIXGHvZhZREM6pdc4tOCr604Xb/CIRKIlC+UcL2VyVhIOhyPvL1UUIx8FjIA000zbkQNgXMoTCBihPDVguoXIs0V9eCIY4fpgtB/WDj7XUJvyfjlfZpuwcSMPmoob4MBafzGHkAFf2AQgrxN25MOyWkemqSyvcIb5xf5bTqVWggesb/cbLXh4xqJzkXVJWpvzdANVY3hlQ7Aqxk84nGOKoA405joRHETnOll4opq7xZeofic4yl4ohsPHHP6n/6Nhq/tTFnj0p30CCEdBaEUAA/v8UyZxgLUHrsLy53+I04pIIjxzqDd8RPO7earwDZkc1uhXmkhnmj6qEIDNvtho3CK0mB8B5yL5Ur8YEHeDoDKKFviELZzdauUESykSn7Af4dkkD5GGtERFhplM/kff8MvLdxED5TmqG7xeRBTDgpfFRKV6Rt7MUKJmEuwmtVAQsV/3KEtD9UZcF3PXsrokajHOFNLZsWlMsux/squm/BBITl+/D0w6TLg3GtZcMhianOuu/I30H3tVnzzEwh60wWaasE12nusSYo0ivtiGRg0+Gu2tefVLFo2UZpU3CsHKPu5u2ckVJaphe+hc/eJ41L6z4gVJndHDot1v7VTMPA7vyPexmrclP/PQydSIAd1okVuVSyrUS2ZI7dS+weDmFdUqifstyWiky3adJ2iCkQ7S/n1P98T7Y5uPnmacTuloXUcx/y5Alsj+FL4f1jseuj5BtXzDXNH54BC5alhXi6PjoJ9Gf1IMuGY1b9lFd1sWHDMwpcY+v4kcw3AQT7qLnkNIjf2gPbv4sHB9FD+uqhfPau7JZZD/ptKLVkO8EJ8U4rh4go7ut4lqOG5GpccrFR3uvGMtBmj4F0Vbp6icxrIyNCtl7K1KN6/V8e7tG0uTi2/vUOY7muu9BBheeqUA4bvpjNppSvxCE2q1VuYfs8aAz6v+Wq6xz7qIB+d4YXAsc74s217uuJ38c+BmU2Et+9FJHo2Q8BR8UsTbM5IOSLl+lxg6sz9mMHLJ0qRVg/3vPQEkHMYXkNDFiWDC8dk22XnGnJguR274/QcQFm/+f2cScM4u8SySUpewkgq4AM42znXA3YMNNH7rgkau9/mP8ytTtKFmZUpXlCkqskyvKB34uwuJP+e3DFMPF7jH0EcyILgprPudC7H3qCKy5tzKcLpE/r1hy8nzs8yHj4Mvb7SCzYOLHlDQMCF0qL0Ck/Yr0hNExcVJtFnypLXKLa1Q8fxMlOceE0mgdZyqcgQSjJY0Ptow1fns1dnIaDslUwY4ArbReJ2msiO725yKNz+MMDJ/3XPN3EWGANx8L3D+ithzSQWoEFkKsUSWHqau8mLOc7MoHWboFX0jQGqBi82W/eEG3AAA=	\N
4e168a75-db4f-45ee-8375-a3dbc5578b2e	Steak Knife	มีดสเต๊ก	cutlery	เครื่องใช้บนโต๊ะอาหาร	/steɪk naɪf/	มีดที่มีคมเหมาะสำหรับตัดเนื้อสเต๊กและเนื้อสัตว์	A steak knife is used to cut meat.	\N	\N	2026-09-10 07:16:52.28876+07	2026-09-10 07:16:52.28876+07	data:image/webp;base64,UklGRhwFAABXRUJQVlA4IBAFAACwHwCdASqmAJsAPikUiEKhoSETjFRIGAKEtINAJq5szcfVuh4gGqCtUfPuii8Aj5QTW0aVzp0Y6pVwXf+OOZRNDJzhVK0M6vlfZj5TxLU1FHWDug+pELCEhcbI/H+kHveTQ/wQx1ygfJGaRf/7lGgzlEKhFd5Y2+QixSu57caxHBYyuF/vwOZ0G4cCa2VLNawruByhL47DeFUFdTSaDUJNGtC44j0mxcwqltTrUWXWKw6J0OAuhN7WNnq4m9Y8sXkeP9AlEWuy5kUXEyNuqaCsbv0Vct4U8coskXJ4aHLkSrfL/oTx5a9W28oJVIdg7kVkI+dS8vD05ZU7u+EWtbgPLLpLJ4sAAP7/3kJMIGMYfode0LpK6hVLksQ1Y+0ScuC6vEe0zFCc6Lu7jyggGZXkx5DCiinJjBhPgBAWSyXDMlE3tCc6uuMZRQVDN5qXvrotLaRoMB7qgfZyePzkaOfcZx7UM9KyTnIZVt1t+GbNSRCC//nKhbN1o3wGoN/PvGfzJEJAAPwlePeJv/noIHyM9feOCMZZzvth0qAMJAnVR8/r2MNu1dGE67JZKAcfzS0l2GZzG2DveqixfvM1+oWLUf+OUmQ9VOg8g9M9CaJrHm+zSaKC930gIEx6sU3imB+u+r915A9KYILEUETqp0QKqLWP2wSj9j4A82UWebB5frJDaDDlnLDckoLaaX2Ffg/Ibv/XEP3XYef/geh+nHYAt0DsrwpBwH/2ywdeO/LrPmv9xuEBp0YiyfRYiHMP1u7LkbHzPc1v0K+6H6rqIJHwmkoWQQYA+OjF11Q/Hzwa6yzyznz8a8C4gOoRs7wRY+/4NUUUF1uA7uWTtAuHtxlRNqAcKku4Tk9bKG0f9M2DmVpwed7MItqJUaRFAzTpZ1qQw3lm6jb8p79rYwxBLNE6tp1Zgm0DQXbYMJkQGAlH7m3fg7zKt1/ECXmlUcJYx7i17nGxm8h1XkPOvU6j2xYYhq3F4K2752uLcfGG3kTp1mL6LGwG5x1L6h2vIB7y+FniKUhUWbdAQZhgq3R25zn49S0NW/M+kIHMOUZY/5/+B37cSk181HP92F/DfjHPgiVjFgnLsfIt1tpOfmAGnbgMefXWUoQy/yitaiwzMJq+REs6qtPFA8gt/2zk6DgG4uzkVzoY5WmfgJLv9egg/A0+pvRq0sA8lvOpwqAK/ECZQN0dQNDSD3DY8hFsNQL3J5sF4SlklAvffpYT8dfM3b4byzLq77/IX0UL+fH6LYLfMgmcFdauptBIoRkFewY5kQRakYnc66VDFal1qWMURo8dsnADykgKe7Hjmk+Ny8FiTPK26P1pD+hi2pcGD90IL+Kk95HsxQTr5Gs9knJ5TnbtEFA/tH7raGYSvbdX/Q1HSaBAUZx8H/0Q8vwWn3eeLVvq5bgdnzlm9W5L8HCi46820ZTOjg5LuqOi3B8ShXde/0Ff2H0xonkOlCSP0jR8Tq37pUmqU1gipGAVo8AtDN54n7B0j2AbUZmE0p0aDtwH+CQQ/nTMWFMw3cVlc3HxqJmwxB5W7JH9B6nN5u8lfyY4G4uAnB4K8inROIobQbIufJZb+j74eh9ywygDAtm7A2eJG/mGrXlPxiuh0jqgMyTVGh9S/3vTXKrGb9fSl5ucjUhl5MB0qT0vbtmG8fkfdTJcEhr8JY8quiGYzc1xDaYP9mcp12tbpbs63/XzPEa5T9Ud18SYvLAGC7mu1cGUAAA=	\N
905f9409-be7e-4b7b-9834-b4da0cc0946c	Fish Knife	มีดสำหรับรับประทานปลา	cutlery	เครื่องใช้บนโต๊ะอาหาร	/fɪʃ naɪf/	มีดที่ออกแบบสำหรับแยกและรับประทานเนื้อปลา	The fish knife is used to separate the fish from the bones.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.289609+07	data:image/webp;base64,UklGRmQEAABXRUJQVlA4IFgEAADwGwCdASqhAJsAPikUiEMhoSESXfxAGAKEtIHeP0Qa/Y4Fc1TP3Vokms62OP1p+yaB1OtfOKbAvhQWlHM3zpL3biOZMKSyhkWedAwK2ThwdClv7eeTSFNFDq9FCMJh/HCK9rJdMF7AenQ8gWRo1ewqMO7DeOSqgoEDJ9vUpxrhiotePKsmneYNDwbaQRJnfRGq9OJz1I6U/9gKAJw7N9qw7SqpE8/E/AU16960xOZ4ppBh1AHy+i/KQm9OnC3omAO9ApxbFAmqJkYjQ/ymSPfUPAZl4t74X/vu+okTSyCHp0QPwS9RKIvyAP789m9HfKML+wS6hiEZLf9a8DBrC8xgz/4rupeClDjkQNFfR9AOwP/nsAsqZR+3pYsjjzYux9Yfre+WEcYIi1JrEpvVAmHOp/Zyc8iogQAclx4gak7trGRevgEqSJlIAo8OqJO2hiRWkhYFstuljQP0NyGhHS6/HqtaZfZqDdfKB7q7e+DS1KFHi4A6ERPfgL8XiFHsKrhgxHW8ogsGZbUk6Fy+Rw1hVz4UUpqqMzQC+jNGXLq+hQtoYJvn8P19TWHKIYgGOVTjdJF+tP8+TBstkWr2CCp9SVFrI2YIU3znM3o20BtEW4ovmOfKNHw6/YydOZHjoS9ifDoAeqdNDK15w6qepJbAhI8tdiXRwRB+mi6VENzI5E1r92FVzBtvT1CxfCE0eFecMEoY2a9vITlT9vJYeN0HjTXJ0Sjw9X70IQ0kKOAvMtKt3U4B/Ki8g+KOhbZ/9L2wvhGUEfI71nK8HfPeAOffGW40HIdPTdjL2IqOLzz0pufb/j0rt0hEwwWqkNgFo+ATIvfuO1WG94exUFGLPOlgfw9M3wiQnMRGFkx0JFPZ61GMJY5TZ4S4A76brpgC6GCpPaYhdOwLihCxQ3eHAcDpzFEahzbbbevZ6EfcoAyN1a7w/lMleKQah2w37V6MzPbqjHZQMTYWtB+14XhAc4KyV1625HDjwuDIPDIoC4CBBVCvk71cCd8eM5rY6BtVlpjWIA4LmPj8Mv63ppzd7GtoTtMp3LCfw7CRmYzk+CWY36nRGcVK0SRpN4z9pKYjUbAnBYca0sbe6oNF7ZezBc5B4DUJ5RAUQMRUcKECgur1s25z3G/uGf7R0tfQUUyM7WIbcuMCT7h0Q5q9ppPO5vbCXWlQ/eRreIOyjaY/UK3lbHNjFY0ax0DhN05OhoUF2o5AEn+aaGVlftQuSonPTWWQJCbsQy5mBNCZMfKvGPWdIBvVrEIsbaWxdAN2EUTyw3L7cIRYCdQU9V3H0qV2kSVWGk2s63+VnLRtvn9W259IR09wT9Nkwj+/PeWnZ1My3p2g+Wd9xKMoRecEgHss302TwkaSaadt2lyn22xnOrcHq6I1YPLMKhood/JJvShmj50sNtSnz6s56YT6kVcD6eHSplo6aJyDukmomM3RUnQ4+arW81mFicIiYUJqp2/irrF/O1DuxsEAAA==	\N
6cbad93a-d318-497e-9d16-69fbf79483ca	Appetizer Plate	จานอาหารเรียกน้ำย่อย	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈæpətaɪzər pleɪt/	จานขนาดเล็กสำหรับเสิร์ฟอาหารเรียกน้ำย่อย ของว่าง หรืออาหารจานเล็กก่อนอาหารมื้อหลัก	The appetizer plate is used to serve small starters before the main course.	/uploads/1787747940053_Appetizer_Plate01_glb_c084b8efb1c8.glb	/uploads/1787747952576_Appetizer_Plate01_usdz_187b71ff0d56.usdz	2026-08-26 18:38:01.089296+07	2026-09-09 07:04:33.553921+07	data:image/webp;base64,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	\N
35708174-9294-4159-92ce-ae42b1b17c5a	Cereal Bowl	ชามซีเรียล	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈsɪəriəl boʊl/	ชามสำหรับเสิร์ฟซีเรียล ข้าวต้ม ผลไม้ หรืออาหารเช้าที่รับประทานร่วมกับนมหรือของเหลว	She uses a cereal bowl for breakfast.	/uploads/1787800314752_Cereal_Bowl_glb_e065987c09e0.glb	/uploads/1787800328661_Cereal_Bowl_usdz_103562a636c0.usdz	2026-08-27 10:12:13.367143+07	2026-09-09 07:04:33.558883+07	data:image/webp;base64,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	\N
6b85f5c7-1daa-406e-ba61-e6b46a16d84c	Fish Serving Knife	มีดสำหรับเสิร์ฟปลา	cutlery	เครื่องใช้บนโต๊ะอาหาร	/fɪʃ ˈsɜːrvɪŋ naɪf/	มีดสำหรับตัด แบ่ง หรือเสิร์ฟอาหารประเภทปลา	The fish serving knife is used to serve the fish.	\N	\N	2026-09-10 07:16:52.289979+07	2026-09-10 07:16:52.289979+07	data:image/webp;base64,UklGRlwFAABXRUJQVlA4IFAFAABQIgCdASqmAJoAPikUh0KhoQoMulgMAUJaW3NUAaQOFWDP0WhmoinWh4590vjY7k3opP8wNdDm/ZgJ/cDfGJ/DG1dsbrYDA8/tH9qV6Fqe0vlGgFmx4YBn+FqUsTxpFdZNdpHx/I/xuFM1FeqiBo32o3B6zx3v+Yf5uSQV4B1yEDBzA63byJkSIKSvcvIrTt4MYLU8u9Nhl94LiS/1xtAkd4VNKRUiQEg6jMFKksRjNxVb5sZoWxD0I4YHGthGUXO3aWKdKSBfeCIH6OnE8sgi8wv9F5aDsV8baCDklP8ebRt7+bO/CrNccq2OhKyXD1th34X48H3t05EASltGndh/Swi9nvQarEeKav6KNKVDa9ZjvIXr1mc+BXsgAP7/bH+rrpMPCRAhKw3ISOJK8CUNoQSGWCi547CG9thhcbTLSIMoi7jVMb68zBDPYmdlrz9lB9IG2kpnNNOGdAEgjK+PM3sONP+W41kjXsX/rwiccXl97QDcatv1eoYK+BeNes+G3AVX/5ygviGW15us1wjCFzkM1Vl8zamjZS0sI6v3tOlqxNTcxrAxSoa38UNPxYI6hrK4hG4VzPRR/CMVQJWtAspef4oJPTsSjDR2OWegJMv4seHvVE6YRUN0IEetQZ+EZNtVSX38F4q34+75LdCMy24BJWhOQepAQ96x3F5h4zQQNLO0Ene9e2fOs6p/0PcTD9fMXQpiNIzgS0CNdFA+7nmeNhZOrfwxkLKMf5UmMJ4HAIELwkvv3w2olZtpIOZxMdZ8cCyX7IO29lz9f0aODh3GszNyaLYgWzFs6iypamsHMfdhKmX67uLd0wNifhJVRdjW53ziLU/RdPmTggOTIHiuGaRI5J81dbdrzPPJAC67202l+9w4cNUQSuXw8eWVrdwbfRXr59UiqxnOqU0p9LlPzPNXJucgflhdyplbFA8ge2f7kgGHVOBn+U+HYphYyKn5LnAho1oMJnM4f6Tuo0v2/mbcLTAc5JivwsbN1PDo+T6N+LB0mNwv8dl3sJg/sbB+32Sw7gitflqPXvbU/rrs0ctPq69HEQhwDIrjqcVO0cW5sxgEnYxiiq8g8MzBIQh8vVDKuJMeqqF0UGxx0yMUlREKAEX5ermI6P8SCqXRjDiJBXoL23I+rFzWWf1Wx0pwPRR/MjDL0/nrfKvJwPPNsdhOc6ySb6ip/MfICiy5C+YlFZh6EFBQ4+jyNz7fGhKzRCsRYd6ItjxRI1tldpO/9OgjAUNxGRtyamraQu74qBmYXD39j4VLrPdPGt4IpC3M5HpPQhYsyI+apiOOH3CXdNquE/xsecu71kb3V8IvBC8OiX2VeXNPA1Srs6mtJ30Yi4A6RXuPp5+0tZlFY1y569tPjXUe/CU8b8DdGLRnSvCBh/4IXP2HHMMudycllCnjguolPzKgzpGMyavyYCr2pzDpvLwr/932HihDIUyP/hUSJMRfekuET3rc3zINqduUpQXH5Jp5nZYJ972oxOyiIPNiEmKar0pwnCoIvYGY1WatS231JAnDe8RnWmN6R1uV+ry/JHFHSyjteblFX3fAz+4ErIzhBu/w/mVV59XOyEBBKU5SxuesnDfkqaoBLx0mMxNt79gvz1PjuN0B98C5N7sLwJtZ0kfR5nlxTPCigZF1Gf4zdSaxaluYAsXNBpneA/JQwzxrnUp2HL7DISLPgoDbTLj7K4Fg+Gegyfj0DaJE2I87il+3a9nbHOEYzWPYzx0KUgpHJqiJAKIJ7lDOZgQQGTquXZCDSXOzPgnhTk3PvN5lkeUAUlRFsOUCehhBhHx+Khb+EGaYQtAA	\N
6d400677-4bd2-458c-8bc9-bc42594a6ce4	Dessert Knife	มีดขนมหวาน	cutlery	เครื่องใช้บนโต๊ะอาหาร	/dɪˈzɜːrt naɪf/	มีดขนาดเล็กสำหรับตัดเค้ก ขนมหวาน และผลไม้	The dessert knife is used to cut the cake.	\N	\N	2026-09-10 07:16:52.290337+07	2026-09-10 07:16:52.290337+07	data:image/webp;base64,UklGRrQEAABXRUJQVlA4IKgEAACQHwCdASqmAJoAPikUh0KhoQmtZl4MAUJaQZ6nVqv39Fsvvuf8i7jS4NnUsRiP9ihdFH4JiY8TY9tUEo/GTcibZx8p/vaJgr1Ba72sKycqs7Jhx9NkSi77ODVM34K0/dOHakFHkEqU32YNrlvUWpt9A0/PH4HbMV0CAhlNtm8S+rWnUoGv3h8GGpDBe/helklmy17GJNl7BvK7CbahB+wtakT7OFSJAOPB9hvN9E5KLklKTNPTWIFfBgdpopyPwXGd7lrGFYr3GFu3lHE7/DZx6OGP2GwtZHeZ4c47Sqwf6n8R0xHDNSg3fqcdcLA/i+PGHMpT/c4p2WRIESBdSvvBqSlxS0AA/v/r9PK/KQUQOH8hrS4LCQ0sukdyEVMX79c9D9yYl78AuoemQwHeYLigmZNRc6+uTH5MRoJmLYLG+v2+R/2mxDnjQRsB+dk3AOrCdx48OqaopegSApFM4NOUsu2XVNSCrZ+0/vk/4TIv6liLa/IufM/5e4PU3d+K/X25yn/6zkukqDW4Hxv0gQMS2CcqSZr9quv8uq3U9KZHc2nuysyZ9q75KCajIHPglA2qomIs4fzv/XGO/5ac5XlaDr90Nqn5lEI3/xF36wm988DoVGFgHPCJQRoYn9CV4npjFvlujCYCNCuMdZcKpg0Pev4q5vQJQM61V6q2bZA4FqxBk6OFAyCeyI5Rh3GEgfQPxMZOMm29PV6+1sHHLnQbIXVy3lOUE/MjrEPoxojtpQ8nsBmqK1DQ0ZB/xAdQ0dCWR/VQDSWIBNrPVdAPJvgJt2mez77xjJDFAmK1ixEyE93k4lZ4P2KR2hKHStWxgcr35/zYzdW7NMyUf06SXFW0InNn9XmZsDhbOTaL/YtJS1sY1BQdx2VaWizN+6OEqBOfedrDJJwD797e5BgQvVJcq4vLuymdQPZv8PddYJsNFsJXwENMwj5wQ+DQqvFqNun1A2Z3+iDJAEwZS/axG832Pdb+Vdf/2kZhhsN/Ck83+e/D4JhZfe0jMC6R6BN23MNSQye0M1b78yVqvAz2syemaTLT/+nAax1LegUue3lA8rRe/gfpoICN7WLuKqutb9PYRlSVmmAhV6lx4IsvLlm2rpTA70ByCUi07qi9SxAZDTROgc3v2o88KSdwO8bXeM3BMjHg97xaDzXxj2dBrae1T0hAs6uY6DINqfKvY0/b8PT6La83GkVx1Dzx2lqdG9Mo4rNVPl02E56ZASzpZxtTIRZUjCi9jMj0VnVw3z4qv2aANRZNxJGPXPRDavn6CNn3trzZf7QmmCQxLcs/BjYQf9hHUFH2uW4Addtvvyu5t5D71GY6mzHXKDHVDvBOCypCqxJJF7Ptwn/QklITRwgnk/xuHb2Gx8gRPIeSL0Ch6X3BJcIdlhb9748NxQV6s1Lu8qNCdJtUsqAGbAt6TaLyxzwrhqf52dCLPOYJh+thER3nUicPW88IoMIR0J+SWNWCH5JL73TpKIUqLYko34h5Y9oHsYd3LVfkmzLSBiXrKiKnIumnbu+D63z6oahh5o2lqCxdRoT04XPbGeM5r3HgBfWeWhW+HPwKIxE7k/gj/Tgo6eAwAAAA	\N
13f31cef-35b0-4294-af3c-4bb0442de242	Cheese Knife	มีดสำหรับตัดชีส	cutlery	เครื่องใช้บนโต๊ะอาหาร	/tʃiːz naɪf/	มีดสำหรับตัดและแบ่งชีสประเภทต่าง ๆ	Use the cheese knife to cut the cheese.	\N	\N	2026-09-10 07:16:52.29095+07	2026-09-10 07:16:52.29095+07	data:image/webp;base64,UklGRgQFAABXRUJQVlA4IPgEAACQHgCdASqoAJoAPikSh0MhoQnUKlQMAUJaW3ptM4CTfzugoiudo1e+qJJO5x/zLy3+tb/f98rqIH7ABwU68xNLwgQMrIRLZYWYmUzYC7gbUQEOmuF3yzq3pyjf/Zhen//SGv0r/UC8vqP4FNQ+cw0J5DelSyh1Qvn0AkypMxloNJN/qAmvtFtVqs/STLUlb2Tnr+lfMevnXSahME/L3DiBZ/9/kRR8k5uCleQGm+dP7m/rJO8gjUhpWWlBLZ4sEs3Oi8X8UMhCV7vf2dC/WHnph7HyjMuVTAqrmpANFoXA09JX8Um6YnqVS7mYcqWQQ7KfEAyt38N2DOXqQj1gAP7/8er78mDp9VqNeNt3FCHs/wTez74mrKRgxP7QheCJrCe6hrDV6OH5YeL2Rdgl6K1hUYV9leRRi4tuQ96wDdyuXJ5Yojug8rnxXhGgh1nHxXAFJJiPuJ559PzJQcxZBNky2mgIlWlX09WOxQ/SCGESd+9jpfOhWRofS1so/c2xWc4PMf4+zR/fLhXPpPQyqceiWBh6hKS2UtZUs5rQUNspEpdtx/Sa0Vefvzdwn8WSAGHv63zc96g3+wekjlPTmBQ/6a/lg38Q+Z3laPLhiQjNklObz8NB1M82PFGus2ISG8UVCfSgixV1TqwksZaZjwPKIR3b+AzzPx4ymaSmO9SnxDmQQ2BRNqkSRD4V0H6EYF0tKvn5c0837x8NqmEWG4sMnVY+wXuDd8UKS2W495ZSU6YK0wc9mSAmM4WiEOXgGUasW2DxKzPH42QGI2wNC70qgU0SDyD1yNjcfNaUv+yZhQQp79yI0hpSsPSq7pHXKzPHXei1SS7BoC6yzSzRxlRZcuLzcNzOEAVFWuEMggatx524I5TNHIOdF+OEv7Kj5se/t5kh8QrFzRywn+f70CNDsOaagf/SO93nV32VyT7+Ky1OGp4u/qU3Mf02glwvfXPtilhr4vcvimpzuSxUorTiqX9j5lHHn5LANkIzq3KHg/hI3G6zq+JHFDJLCRPyXCyR95lvjj52L/8VHD33lHNveKpj4ZPs9Qd6hJ1P2wAIYv2Vjkf/t9iu/ktw2H8W5Frz8gMJ8DPyypJZ6lRDZY9C6N4b4l+mseaFLMvSVp8xanG3tHHEHNz9JILRknOYdwrPmC2dv0gou3Qty3wrZInFgMBmbU4hFjY+nG5UEKMgueGkLwFI9SSH8v0ol+mmDPHf/GsSpuvKHdVh2EtSbeqmDNzKj2hd/1tcdFcXD9KuZ+DU7sTZWIzVRaeQrQWINcQsqUHj/PbBEqPjYwpIA5apXoyLPPmhWrsxw09sjOko0rE+7liTW8Ap9S303RCJxHXlsYg7xYvQeJuT0XiTMHeex6d73tlChw5xTtlBR0GQ5hMA/FsbAcH6fv/y+STI/xc6bdr7qB9Qfl8VwUDbl/yRO0zvzvsF8bc1YsxYUicJar+2/i+No5bMDEx5Vna8dPkLRew50O3pNXinrsj9Uvu7vKOIU7OJ4yiSooXAt1fD38ONjQnre5ALvF/wRgmEKVpBarofz5zk8oXfHBlpICIBjJh7lueUoh4lhGtsnnIiOcq8J1Na8blOOLkSS1AR4zNr+yUVWfBF4Ylf2P7SniL+EDb1fbE1wGj6uWllQdzNYRTKhs7iHjk1nyF3x2jXTO/fBolX7Q0QC3FE+wEENCDAWW2caMIAAAA=	\N
ed599789-65ae-4c15-96d3-31bb28b2b7dd	Carving Knife	มีดแล่เนื้อ	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈkɑːrvɪŋ naɪf/	มีดใบยาวสำหรับหั่นหรือแล่เนื้อสัตว์ เช่น เนื้ออบ ไก่งวง หรือแฮม	The chef uses a carving knife to slice the roast.	\N	\N	2026-09-10 07:16:52.291308+07	2026-09-10 07:16:52.291308+07	data:image/webp;base64,UklGRrgEAABXRUJQVlA4IKwEAADQIACdASqmAJoAPikUh0KhoQnFKlgMAUJaW4xyE4CpC6wZ++6KiaZ0+69xZdyJ0VgZ3/B7SEC+zoP1aUT+le0daoKVewadZIvA8kIHDBXPr47fMqV6J/MmC+53T9x4hNDqr1LmVLEEbNpJkoltEq1qIwrCUPyhhuYk0nDCJn//1khacaTEkv6d/7gIsnjHJxi6PI8uvnaNxm+tJBfzyvuvzreqMVMFEoH/NNir93keINbY4BmT6C2BNyy7c3ZyseviKo9L+n9+tfMTp0lsWbf7zpNDYSZ/DgO1NAY2roS8b1j52oAkABQQSQk8EH0nopOCQKFZMHcfnCge8AogUDZouBPLHDIeZVScxJcPlhQAAP7/7Y/4C/iUVKJDQovx5qJvKmCqBUi8rYtMz2zwgg4Yw8Zr2FWrKTlU44wSjYwo98kMi2LFk5iPt9GCX8ohwGtjL1Y4yL4f6RfyHYlvebyqexKiejwsfF7SEnp/QIcIOlOcq7/b88l73u82Z7bMEsQs9FvEQCdTYNW7lJui802kZsr7auUCVLBC/8GVIgVQpBbZGvQQzU+z8rY0cJR0Ue+PoBEq0bPPJUhVAcXrHCaZNcev15WgmBWt4mvByyDE1Ds6wueLjCxz0UWX/KnweDrkE4aKVvDkHk+PF6Nvv5ZPq6yZMHBEGeWvOALxBiA8cTvwN5lj5llNl4pJBxOcjzMaM8Uta8xKqXB1R458vd6RaXdZoM9NpOOp9uYdngs+tk60vhslQerZ7SP0nAmSIVmLSavDw2Mw1b8lOlzsGVZ2a/gOd/SlNEPsw93I3mYrwpi4Zh1/ibGPTMrZqX2WnZigwN2HRH1Vadk/swWf8yn0OKSbB7UiT8z/0CU8nCsCY2QpLjIomPzEB+kl0GOeOTADqE1ny8BCdvnJv4S2A7dCEo+f/8YpYuBHYGT99lc6wCsPHaAFUmVZ29vDDb4ghz9DJTiyNrHKGMBXyp+hT6lOt/RY0Y2U4WxZhkMfmnDdthawaiGX5dV0whAKqtXlz7q1To3fOfwFIrrpcTPdApAatFE9oWsOL7FMFNL3MZdPwZaVyFug3bQyCSY+R7+JrU2Do989Lblf+pKub8lB0E2QoRnJ/Bbr7Snc6mbOAxtGF3A+dXfO4sp5uAW6R97vDO/E7obo/ryloo96wfcOUV+5epCc2s4hakDr45Jnw9XzSNBSNnprL3/tzwF8OPIYac3WcfpTL6PwRwepW9nGm9oVccbvPCO8fHCdXyPQp/PIG4p7pnWQD6Ap/4yqowqwEfewOkGAQr3+qQk+PcXiQrLI+BrlbWjiC1N/Im4nF0aMbUw6VGDXMHoGioi/M2P0a9e/gnbZOe7EQ4sCKkFUjNKD3uK84Tp+3gFeKV4shKNPM8KV2MBU0J7tEsOsQAnRQGe8mog5KQ8gqRcdBs+gt1If4+EQWdRbfpFM9891tV3eV6zqXznJuCp+XkCBAiGqjIl78wql3VgrsIoSGE2xoiNY9tGVtTRC8Vq7Di38/yw3MUbyDOkp9dz1p0nx66BneOYzg4s43A7VVY4ykjI8Hg+TGHAhh1nejzf423O1Twy4hma7DoWfygI19IAAAA==	\N
f4967c4c-3b7f-4782-b02d-fda74cd6243b	Soup Bowl (Soup Plate)	ชามซุป (จานซุป)	tableware	เครื่องใช้บนโต๊ะอาหาร	/suːp boʊl/	ภาชนะสำหรับเสิร์ฟซุป แกง หรืออาหารที่มีน้ำเป็นส่วนประกอบ โดยมีขอบลึกกว่าจานทั่วไป	The soup bowl is used to serve hot soup.	/uploads/1787799662101_Soup_Bowl_glb_bf9a25e12930.glb	/uploads/1787799668263_Soup_Bowl_usdz_ed2052788850.usdz	2026-08-26 19:02:22.318127+07	2026-09-09 07:04:33.558459+07	data:image/webp;base64,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	\N
963c9c26-70ad-4f07-91ff-a05279992cae	Brandy Snifter	แก้วบรั่นดี / แก้วสนิฟเตอร์	glassware	เครื่องแก้ว	/ˈbrændi ˈsnɪftər/	แก้วก้านสั้น โถแก้วกลมและปากแคบ ใช้สำหรับเสิร์ฟ Brandy หรือ Cognac ช่วยกักเก็บและรวมกลิ่นหอมของเครื่องดื่ม	Brandy is traditionally served in a brandy snifter.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.403775+07	data:image/webp;base64,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	\N
e9dd39f6-5b1d-4846-9d1b-c497343c14df	Water Goblet	แก้วน้ำ	glassware	เครื่องแก้ว	/ˈwɔːtər ˈɡɑːblət/	แก้วทรงมีขาสำหรับเสิร์ฟน้ำดื่ม น้ำเปล่า หรือน้ำแร่บนโต๊ะอาหาร มักใช้ในงานบริการอาหารและโรงแรม	Please serve the water in a water goblet.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.355803+07	data:image/webp;base64,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	\N
1392d0b2-9a6a-4a52-8a49-d38a04ddfec3	Highball Glass	แก้วไฮบอล	glassware	เครื่องแก้ว	/ˈhaɪbɔːl ɡlæs/	แก้วทรงสูง ใช้เสิร์ฟเครื่องดื่มผสม เช่น Highball, Whisky Soda, น้ำอัดลม และค็อกเทลที่มีปริมาณมาก มักเสิร์ฟพร้อมน้ำแข็ง	Please serve the cocktail in a highball glass.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.37113+07	data:image/webp;base64,UklGRrAFAABXRUJQVlA4IKQFAACQJgCdASqlAKEAPikUiEMhoSEROcxAGAKEtIHYD0ha/43LFL62Mef8Bv8AC6g/KTsxjvW5HweC9ghAD94rd3C6Z4chQZzRGmNkCzhg0tzw/d25LKtkyGBfZ9B3vsT8fV3/INoNi5WX6An6GTjUX/6WHepKFoh2ZFF70G/uBRVtXha9fKjb7V3DOTPWfZBNUMfjNq8chb5j9WkErKewbvoyc3MHQa6eJHtP9LlVHMmB5qe4u18/WV9Qq+HrAgS23c3V7B0vNXK48mprkwr9tEJVGdOBLEfWEIs6WntLFEZyBo+zCrkdMK4K95uiEVA04+78+6PRSJhtouvOhmBQ2vxKrve9JA1P6VwvYWNTj2mqQYDlNWBVEKGKRSZCGUxswAvNPaDLce/UcqLdl/kBgnqlSLYFgvX2oE8lePtwqAD+/MeW7oPi2poMirBCGWNDd1oiBemSxBtW+0uERWWPVOXy8bSAIJvHulzD5v+aIXs5AYMSPbBdss2hL4aY1RL3Xss0SNnUrUwthI7OE6r5zvlskiPDqs1VXSitS/V1SuvGudAJPV0Ov8XrkPT1XYNTfv4YY7PCu08sCZqp4Kkk9lkyZ1ebdphitI9lx8AyLpinGUt7KQ0ZIxITbo0EZS8AljXnz7m7gHyqUGOVxCNZAOhE+DCWcg8gqT2BBTfswx1MPUITGM/CtbQx4lCmxKQM75Xygl3qRdnkE/213SLYcoGB4yJAIbxGlqUW0ZfyIDHUGRgav1DdCmd0LN4cspJXXVIyTNrtNV16v+bI2Dlkh0d1SZq1VzmUyHnJVatLAf57eDGK0pG2iNT/3DER6nP4CDKL+cZ8lQvrOTfhAEhE9G/dmRbJ0kdVg2laUb2gWeCJdOBoy5RvbOT2lFokKBBZJAdXlPSBKmLE1VKI+PVEHXh09E2C89rosSC8NpWWeM97T9Os/kxm9Y4ZRZ7FlUhqd7z7HZz4SoZ8hS6xqy5fETxcp+bmrnbRSx6IcIMHXp8/71VLLZtSnKKcSbxLMDLb1M0h3R40LWm1K9zEqINYRMXeY+1D7n3VF8twRDLIi3GmVh4t9oiyyeh3I54+SnrYaE3G8KOeLuBB1GgeCHp9n9pWzi8v+P8H7Xdt1kgn85+KSWaru9Y2iwnABH8eLu72+qBdGWb+77dmEKJrfEFWfCLQDeZN3BX1YGVMFuBcUPNC4OrjOVLPJVcR0HbKdulIN2v+jo9hlFbKk8vm1J4rztV6oK73KBmjP2vonPXiOPeHOQcprv5DwRZuTBlus43i8SUAJIV7xg+VjU/5k/T1XQ1MfG/u2aLy6t9Y8RxI2eeZ4hyZoGpwXAfGXGu89YCgscaQTMvpsFr2rAdCjZ7PRWezGO8jAiOclRwJqSHA+fPSSCK6xMWB7Pvg3GdmEGqAOmWNIy/g/hbePUMvjas8a8c3XeFuZm3PlVPqlhpckYvjooZLbakey5wykAwrvBn83pI6to/9dE2UTcJ5Eg9C4HKMr1YLdtqsae4cNp7ogzct4Eeq2ubLm7n90bbAz8ASKqqOfxBFwAs0VHwr8jIf4Dk/GcTeWgEovLs/r6GrtUV0uabxWLMSbSZhuMsF3K1tt+qdOYs29Ou0FJAiJZ5fql+rsFQjTTcmNGFsob7dITG7HtZBxrlu1pPAK6jK+aBeCmhTAqze+3dOBz43G4D9aveye035/svWXwXSKVjUvitS6k3tg/kbIb3pOPn0+WZ1iiWv9fN45+4LwUZ+xV018ejxrpXeR8BhRe5q8XX+T2mJjBYF8CJQuCXaAuyyazWNrUBHv63rNm6BMlg8c1kLDJRejis5BnyxkkMjluSzEmhKXmBywjMqoBy87lj7a6ssSo0ZcvZshynCANsPiOz/tVczJiHBeMlX+D9T7LVrTOqR+xxMmQikxCaGrwRRDeQ9lG2AAAAA	\N
d0ada488-8a48-4826-a663-0b817c964ad2	Red Wine Glass	แก้วไวน์แดง	glassware	เครื่องแก้ว	/red waɪn ɡlæs/	แก้วไวน์ที่มีโถแก้วค่อนข้างกว้าง ช่วยให้ไวน์แดงสัมผัสอากาศและพัฒนากลิ่น เหมาะสำหรับการเสิร์ฟไวน์แดง	Please pour the red wine into a red wine glass.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.378994+07	data:image/webp;base64,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	\N
6d26d6dc-2af8-417c-a4ef-7531895024e9	White Wine Glass	แก้วไวน์ขาว	glassware	เครื่องแก้ว	/waɪt waɪn ɡlæs/	แก้วไวน์ที่มีขนาดเล็กและแคบกว่าแก้วไวน์แดง ใช้เสิร์ฟไวน์ขาวและช่วยรักษาอุณหภูมิและกลิ่นของไวน์	White wine should be served in a white wine glass.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.379807+07	data:image/webp;base64,UklGRqoFAABXRUJQVlA4IJ4FAACQIQCdASqmAKEAPikSiEMhoQic5kAMAUJaQOwHqG19RweKWZLLPpPKd94PvzqQWxMElW1y6IcxZZbGP3Vkdxuy3Vi24eYIMOTXdx4PwuUoLmx+HzYZPgu+BKb67waPYzx4E4HKQGpjPi1GuDWYpZRZHOJTA7DsvDxDg4XxAWe0tvQUe2v8tAlPajVJtAw4pxkru8jYIuSsGyKNPwCeSv0ym/v3u5Pjk1rTgGykrtfg6WbvLCSicmzYjHsNo/J1KWla9Tg5gEXN/aEf11lBw02PUEWMfHTz6nNElgCYbZ4p5VIDefgIYN7srk4y6mR+d0aLK55HZ0WwlseWSSHZx8u/qaArvu1H433ejiDg+eCD9HstoHMgAP79NCo5perHyqWgTWjqjFFn0gK0jkmCZT7RupIK0hgszTlYeSTjDzAd+z3X0cLadSUBPpxXjn1VuxRu0sFnAbNEciemPeSkuEDyH/FN8cKHwopn0VZkJ3qmd5MS/IoTBsuf6Y7OcX99pqbnNoE4wxEl02J2zWS/7hAGJ/0F1bKa3ie/T6TaH+BIYRIFgkpIJTytzKc6tElzmaM5s2Lo+jhhmiAcpQbqigJTXMaPsYlGaQ1bVw42hwmyFoJuz+KWuk/I5t/3FLxUv6fC84zqxpiJAH04XXgjBsdgqXa/6/CS4vC5fuk9MeYQi5tp2fOmx5eZR8VF5YkMB02USgzKde/G2c/n9Yc6+ZVVrJdXmGanmQq0OBzrk3GesVijU1zIGBTRU2qaG9U9k52J7lZiPrMkB7SvoNneOUh4JyPNoWEzt7FRfeNKy8D3KCD+mCOVfjsREC70FGVl3zrE24flz9ohyFgcK0XfgkqqH7icC9WkZE5i5SSrJOpTvjAbsVAGgaJ9xYSl2lyyihk261hiYaHi2aY0ox24WBuIHADJrl3z4S3Y5sPGMuLXgv7SSDoS+hfdnz/8H4N4ICsXelnCsiHqxxu+0KzUTKxauTYh5lQlCnvAVwKHshsKmtKc2lup5oQSbK4eQL1lS3TDPnL/xAfF611q7ODlN3E7JNtuX3qzQIfsbNDNWU/KbL40bDVeoVL6iTfC7zWuiMluKZhWtFpb1Dp/sp84GDd4f8WN3ZSySRjP54P3BG2n5TlL9TnrtpnmF0aoYPyPJa7AK7cY36vzhz3vTQZpSA6pLXLtf4K0rozYyv1OX9/hrzz6CrYxef8ma2wmuMKbKi3v/6oLrr/iLhuL3eVjyJgO1AiQmZjzUdjtBsFv4n78C0hc2dJAJQwPefaOtnp6wvU115q46a0WTFXVLXtq4fjNSkY+Wo7+2aFD4+nhhbqFGEo/m9LxjRpCXNtEtvI85UbxfPqNf9ifJCIu4bMKo0wfnStk8eqtpnc2+BH3arutrSJELsoS9l1tSHqGURsvH/toMPzLVO1IUwMHQG1C0wJyPm45AQPjYBhxz06wV/W5NAeKE6jVNunj0XG04xyOn8ScDUN0XmblpEZqe+FnFh/frB/SkNO33DhfR4wHNT4s4N26KF9K9CPLTr/nHvLr68B98wuheWOMIIc+XHItNrsK+mhENetMr5t/8wirB/Gr9zNJwpuo5Sa5Q+/ZnuGCNTjwNxDwaAW1cimZiv+7AREVIVmYCxuWoXbKIoHX8+G79E9fNK2u2/f249ypMltfEvkKBNll7NGMfm/P5QhAlJbhNDefay3ednYXY8spomyoxwmnMu1VJHNRcy9cgB/l6KXWhQJjCQRGbbr5JMG/mWLrEnOvdGEQnNOMjIseeto13IFf7JDixLVuOi1lk45tFpQH2miQh1lkJb8maogkndBYz6KF6CE5hjeZ1gXi4G6lDVQKIDZOyhurEZ0c01ZIPgV4bSwjzh39Oc51pDJ966FNkUTT1K2nKhXPUDeGxN3Oh9IeyFQdj/wUADF8XAAA	\N
8771a021-93bc-413d-b3cb-2796c3439ad3	Champagne Flute	แก้วแชมเปญฟลูต	glassware	เครื่องแก้ว	/ʃæmˈpeɪn fluːt/	แก้วทรงสูงเรียว มีขา ใช้เสิร์ฟแชมเปญและไวน์สปาร์กลิง ช่วยรักษาฟองและความซ่าของเครื่องดื่ม	Please serve the champagne in a champagne flute.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 06:28:41.38028+07	data:image/webp;base64,UklGRkIFAABXRUJQVlA4IDYFAADQHwCdASqiAKEAPikUiEMhoSEQuzRoGAKEtIHYNualo/vx6dspS5NP3cZniQnle/IE95lc600os7WDoxq25yB1nlCi2jrUJageN5yvrnI8zQDqJbJ9uajTfew7J2jNosXVvHYCo4lwBxG0h5BRoKX8IAWN/Txu7WZ3maGAlfS7me/YWvy3HAhAJYZxtt81xL2TQkfDE/hzqv4xWpVyZ+ZHwux1rNWF6ET3i/H+Cctoehu7VW6LtHtUg/LWJTKfKyALWSWhTIrE4qICBTG2Xf1fmPYR1xv0GBNmPMSWOrgq6JalN2jEU+o0b2A2z7USiwiGo7oHvXClfjldH1fohiwM7XnaMxjEgAD+/MgUPoPi27LVsJyTMv7gv+GibPUnu7NICnmmvGfqiZ6iRe5HVqMFa92TUf9yuBtyv0vvsclEygkJciHump5F2Cmv/RA0VLPd1EI8w60IXYjBKgA7YAutNEQpTk61chfKdYna/FAXKFe73fjc4biwCTK41oZz/x3CPbSU07eM0f1ucHEhWccqQ9AJbWxNgTImLbQyEgiWASnjpM69AQAfjUwgomLkEY514h0NwCPvr3rDpyPYq72kTsSQboY4Ma9gYbaSPSVi8K4T2eq8kufBiNuU5tW1X0saHNhYBXmpbN60R4i3WEXBTFk62G7pntEfrmJXot1pTwZwUX2T1ukDkQYK14HtFd2t5l8OvBa4g2V9sbeiD4TSbUjH29flfOO5Wa+5yDSDgr6c4e5H8n3K2Px9PO0EEocne2SKoDxIzlGlghZvRXiaWmtLlwd5i4AEZGFy6x+YXotizRdLBono79XQYP7NXYq2wEuvw+ItO1D4VAnMIj750cmcFWJdmAnZVLRn6qfkBAT8UpcD2Mm1ovMeLslvFEsOrvvE9Kxtoq9lrT6SnovVTtLc0psXQ/KF6YOjUMPfET1CEKypMB2zVBjAWF+zTOgt9GvfXPOpDJCtmr8Wv0FkvcAKZ8ZgJyYkGuu6YnTn8w9AOGiILgz522DUN9EmDHuTUmMcaTos5EJ5DidrPc6W+EI1vJP4L4s7Ppty1CH+IBE+C3+IRcLr9D8sGKgzBn8kqZbvFHYvSiIeMRazppty4ms/2T0uYC4wORCWCDDC9ftIJAT94lSXB3TYkdoNGIqlDpLLg1zJv1iCP9Q1sZhIJiEsuZog76TjbazudBDugJyMZnXrh7Ko3Ab7GUBVpEWb154lqhAG53PTjeFCq+HmEI1S6k1qkL7wvKcBfWMS5NqEq7qNEvRLPC3jydXPUo88XCeY++QXOyq6gFY1Vpy+4SaD4aO3Mm/DtojeXt0fLWzGo8+H9E+POhHBBn9fEV+6K0y3OE4mOECjiGsZvATu/yi+69YyfCdgB7mHKr8YRgJzNDH+IC94nVDITZb1kBiAtSHwDo65LirC1PVqMChmbJOO8hpmamvovYCdWAZg572CfllU+S/QLknUILmGn3YXk7n71ERbX63l8IxJA/2iqX/eUURHHjubvgtVn+zu15kM9Rcma5bTjrcNTcMzzF2Udac/nIqJ25l69aJVxtmk7VQELX1DF+sqhuBOk0Lz/MU+trt0yQat+4meZwvoSgjBiFybrtHLKRV04VqV8MkQf8BX4gddwAHwy2ycwDdF4jQ8hxltjGyGC8j9hnP5Zv2NeyBagrK0qUAhZ/DA+EgHO8C8KiVnXpgSw5gIJT7vrbZwhEjgIw6bMAwnfs+DZGyg+J7ahwVlHLTW6wgy+Jd3VyiABNGYi6zbG9XD+BgOTBcpFAAAAA==	\N
6a75c9fe-0cb8-42ef-a144-a1e70f78a6c3	Dessert Fork	ส้อมขนมหวาน	cutlery	เครื่องใช้บนโต๊ะอาหาร	/dɪˈzɜːrt fɔːrk/	ส้อมขนาดเล็กสำหรับรับประทานเค้ก ขนมหวาน และผลไม้	She uses a dessert fork to eat the cake.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.266541+07	data:image/webp;base64,UklGRgoFAABXRUJQVlA4IP4EAADQHgCdASqoAJkAPikSh0MhoQnkdhgMAUJaW42UAaQOCi387puSXomkdf6CwHlzfWzzIvQDxBaAH56/3X3AfLxpApMI9auRpLcDqp8zfl9D1nTlE88Btu8W4PDd981vOeeX0ZoqUtEisz9R5swbfQez+BICMK0oOxceqadddldci4/rK6r0NzONF/zLCvYoZYwhrkaHwcDDQsNEmmDD/ykazNmjdOqq5wIZWjCxnjP/HHsYejrZSV03qT8kOFcUAvcUYqbhPIbWJOLKsaewpcdpNVb9tTe/ZM0ifj136nb2Ks9Wds9lqulv3Wr0TVCHF/De83XZuRsOZYiE49ZbZAAA/v1cKdv5WnzhcigcgoMrJsUboBgfoe8NqNhs+jiuIRJ7gAZwJDn5f14w3Z9w6TfUJB0QWQgqsJilEUhmVpAewZy5K/EY8NOXD0Pfv1/l54b+iP8NZdwHmpp4iZa/d49t1mIBYTsIIYjL69pxijJnnTQk+zGWv2/w1iVtsj+qef/hm21xfVmxzv/zmJjYOej/5+CIgy7CjfjHIj7LFKhIP5fc/Z/cBSYGWFVPAQed+D5d35xy+rPPkXQ+G27/6U9066aJ7xCwBrqefygG8y3K4u0B4YxjlUHPphcDgbLNfd3P6H9B+7fAPn/3kshgBlCFA8Jmh+lzzRVT0p2mv6VLbDYKq1xppc7TuN7ETWkulTYTc1AYw8e/ZYU6q8c5npERCpVhwpwqpriggH/InThGJmGpP1PijBSEfBwKiVxD+RzAN7VkBUVWt0B+0W8V4wR7iGFBmm0sy2cUyAbQAeZqcYurXZySwitaOM/JWwZsREyBTD/VSN5TtcO+cRuiXKgVXrA35ffRVIl6IoFbpCJtuTp7qMjhnvSZM7/xpdXgxlo6M2ABO5brSfcffNHnMUX+PAmrRdIWq8fmUSH6J2Wloy89c0Os88NJkBENU6Xy+TBf3Wxl/HhCSHKjbRYCt6+PkhjDs6vQP96ddIQ/9d5aGjo8mMAtEJnczx0Y17QDpx/puT1ebPfwD8onJpbqskE74ppafo1kvLXO5wjfFhdZyCsD87LyzMwyU/REswkxt7yWf7qLzPUAUdJAHlvcYOlIAP05XREN9xsuo321jcGfZlzjz3ccTURMdqM6siBAa4Bbb/zIh9lf8764SxAsi78bxxzU9z0gY51dvZI+eXesklSmBlGUwvWKdayP4pDDq1IH4Qelqf5iKoRrW57RS0hXeUTskQCiJPIsyrUv48DuCGLb9/McSCwPwHmpD4nyGzW9K6pyAZTstr/ci+7ji+0yanEKhqSiDEVYCMp5cZNNJ59790ot+JgU04AXPuTxcQRv2jE/Aqi6PLY+I8lmWTpoCuCz3ecp5sVu3a3w55MqvF7neAcb4o7dovI3zGtbVecptf6Cb8Qtu3Iuh7Xw4ju7JPkLJ71C1hYExACTR3JpjxSLS3BVQCxXSlc5v9+67OiA4rSmyhZ7z+zm73zvivmuj7uIxR+1gfvDv6BJZqz4TtTTBTFA0WWs8PC3uthdOtScuysrIA/dsQZofLAK4NtzPTIXqInrb9QKnntx1YnarTpbhhKRZUSaYHO/xcVNJ5ADZ7dA5faBkHXKVn4nhACcbS4BHB9mA6eAwzv3bi3FHwKpwdL8Y0O7+NhBbU1A5IMb48XSmtK95LOIXhTbOGkb6eceLB0TST10u5cAAAA=	\N
51cf933a-fc9c-43d7-beb0-48a8804069a1	Dessert Bowl	ชามของหวาน	tableware	เครื่องใช้บนโต๊ะอาหาร	/dɪˈzɜːrt boʊl/	ชามขนาดเล็กสำหรับเสิร์ฟของหวาน เช่น ไอศกรีม ผลไม้ หรือพุดดิ้ง	The dessert bowl is used for serving ice cream.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 07:04:33.560227+07	data:image/webp;base64,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	\N
a75be0c2-7f47-4736-bebc-f42cc00bda1b	Dinner Fork	ส้อมรับประทานอาหาร	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈdɪnər fɔːrk/	ส้อมขนาดมาตรฐานสำหรับใช้รับประทานอาหารมื้อหลัก เช่น ข้าว เนื้อสัตว์ ผัก และอาหารทั่วไป	The dinner fork is placed on the left side of the plate.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.246347+07	data:image/webp;base64,UklGRiIFAABXRUJQVlA4IBYFAADQHwCdASqmAJkAPikUiEMhoSETqUxIGAKEtIQ4A5AdXRjnEQ+4qJNK3+csCbE1qg95ugTxWZk/9l5gn7+I0G6zu5qzow/SDTJttdB6ZPWtJeQZvShn34p7xxknj6F0iYDkXq+n4v9QPIEOqd9TYEsXIrNbGAjcbZoe5WhA456mS3MF7u6pFGL0F0iGO4jnwXsb8+rHw6Ds+bk19pJP6ZhBPyRAFnRW4HIsiIOeyTw7PMlduCKZBrDEU1nCstB+cXCRNSIZHlwe1kvJkT0+1yehZwWH5iUX6wGtUi/llUCFN0q7iWlKNAf4SoVWsqn1GjuuoeYUcYD+Wj1qeoU2gMm3lNOVvjh58AD+1v/txGGf429sNckawA201CdvrlQYFCbgT+XJ/5EN2Pa8Gm0mI3ppZ2YaOZyjc9Iks1SMm/4L//xKR9+QbXDLzQTP3//RwJBXB+45/bX5UiPiCHLb98yVXH48DPGtum535aBLK/UVpeXp6rcu124nRK9hro9f/pfawwoJOQGNluQNYVoWvJMqbBBeWYjL/WPiTHEjEXr+o4JRFHhQEiBPn983/1jI7aX7JHE/tzVgr4D//4YTHcuNc7pDU4IzmsDFxdWYhatsBkQPRL6eM33H+DBT9LTRGVqqUEzHE+SbptikH4eEN5rIzM7u4XMKNgRdYn48luDbiwC5S8ZSKn2INk1nQcL8xe+C++Bc/T2q1DAGg/C6S+rDgSv4lZRMZmzZMMs9XQGoaavl30seftnR1GTvqH8/k4FEmlp/cJcywc6d5xpiotJgQwDd5QXvdkt9OQeVP7NzIPe8WXO6K/+BFFiyBpsCYNjJg/j7+SWV+g+usaHtfNILWcoX0z5Qbo3zc2CNouh2hB4krNI99pTYjFcTGtdNAQvzCJ8qBZp8zsIwEyHwNXkjNFqdQ/aQSjHtNR3rDJTpYTNWHuPd3hPsPo2dxr9LevshGJiHPqO+3+fTnIfe4myTrToq7cpDyTvRN2mFOecC/0NkPchZ7r9d99+qpIexHeX+eTVwEK8zJgICjEEYQf8LGKzF2DM54iklx8Y+veI9DfOoJLjgKIknRP2T6BnZg0jso94zd0gGR4knr555WqJMJPL1pcwtwvvvb2PXD4FSvHLQKvySVTBZfcpA7IRLwYn9KOIuXklV6OPqG3VQAJ/L7vdCV3BiMKKSNu14lKhaVCPfAbU65JmDUO40cu/KAYk6pYoeHC6CY7olTV4wMuQcBhdaU+I1PUguSftTyCFSdtkXyAfrSYt1AtujvehjkoCkFyltPafer60SqQyAJygZq+Pnb5ZtJhludTZbOaAaLd7s5z9khpjOgQqqm1XRtHMpS9VGhDhUeRoq/hrlOnPTCt9r4EP8wEpSQqtSTToD1JahjFomyaaZRQIBQNnF3YOLX0PqcWhyqDkeZGtniTuH69mVWCS/HrK4LN/W59YbXtuBHNFV8li9L6MVu4hEoAneE+2wT20AJNhP5FC9ZYaN1z3rWUrFQvnQLKUJ9sB1ltSQ/3oTozNccb+MTe+0Rz4XE6gOIXqUbxEa9VFeTsPW+Ffg084DnGSumRA9krzCQLJ0tWEtTtU8OqIcQl2hvCjUKldq6SG+TFeC8HEoshdcUiiJCsPWr0lXxYtC8JUyLoG0C5R4e/Fpa8B+zryR6ADVy+MnSQQ1PYSa9hJX282LDMklQrrC+/b/KstPLOQxdavOXx/mj7v855YBv1nAzGMxWYUYQAA=	\N
708abcb3-34fc-45a2-aae1-26eb6c8527e2	Salad Fork	ส้อมสลัด	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈsæləd fɔːrk/	ส้อมขนาดเล็กกว่าส้อมอาหารหลัก ใช้สำหรับรับประทานสลัดและอาหารเรียกน้ำย่อย	Use the salad fork to eat the salad.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.263165+07	data:image/webp;base64,UklGRkAFAABXRUJQVlA4IDQFAADQIgCdASqmAJkAPikUiEKhoSETigRIGAKEtLbjWAcMIfyvPHz6dDg9P3oHzqWHRrW1X+4XO54akyf+v/9j2n/87zNFtv/52Uo+W8dWgHzMrEXzELgCgOXrROOe+f9BsCWHTH1OGaJdjbyfmVQoqRc8unJKeLRZ7dwO6aMMELa1F/Bn3wwrLUXVSZJcpBpq75xxaCtkav3aq1b2USg5kVIPHYaHgfjVHoRZb/cPdM0xvFUhsT2Z/5ci1Jwz3cPMPR5h5AGHX1VIIDxRMzcS5/yjjTL5B9PV8JlTK5MtE6GuGU6Ile29FU6mLE84w5Q1sJuSeNL29tCylkCZUKexNUBfhfBHXsAe+zBX7HuAMJIx2zT46rMrgRWJOa4zgrSyAAD+/Q8D83pNDqU0fibpnu1XxlQwcBUjLM8exHuUpBNiYKkd1EMSgC/X/9hSle5v4vx0UJ3nHO9PILLC2kf3cCS90cTaYohDQNERrd2ICAMBoZ7aIwQY5gmHWam5n+MQW9/K90R2jeQf4ATXDpqeVvasvFVAypwg8RjWmZhrnfqS4BMF2fU/Qvb862THVQ5ojb135EgeCgvuVGITEKeJ6W/tNh3W9Pop64dBD8Rf8+77vm+JOmKfzvyMDBRz/6IFSf2PaU+OHF0jxMDO1tceyMVUeZj5rSRIGX8glPFJlEV2B6bG7AFfYw7Z04lz72fyJ7U7Dmv40h9Wyy1nKwufAnJNmiH1ZNzGZ/VfjnX37rYWRMYdLqCmDgJFle5lM2xL2EiOvUWjFVfPcchWdU5wIiZIWF/XkEh6rfHlW2nCpNQo9cL16cB99DyQHB4joeEeR+vbFgYCZ2C6a521UJ924Gm/Tht7Q+wpFgtePDotiB0l4AGvdTgmLd8/r9YYXGtvGboINmTlOW30dbL18N1BMQLsC2m4NdUMrDdlgDFGQqanlbss+vPNr0Ab4QjQKwqOqqYUvXDH6MSAqcjMIPW8KlfQdKHJukbXUme3F+Tm4giJdlNrTy1q76MtjN1wtcN+dYiB1WYf9aKW4CNAPb92P0uYZ6SeESpqXXSWQnyZCgG0sup16Imi1GOnTvFd0Heuv02g3jnuSPihS2APSSFD31VyA7HV7TQrlNyMcszFoflFzBQrV15AahtA1bTGlO1ryUgJqHL9D/mWmY6e45ARp3Z3j594zRJivFjTEe8zo826zyXO+uiBGvfRZFqxy64r5Eko224RY9iXLgPYFnJp6SHewYbvm4XCTrkG26/g6SNn7F5uvQCJ4qvGUbQqrU+0/Nu8MR+APhnfRqG4/WEaTbv2GI/w6osCQKVWNzfx88TX0Nvr+SY4MPDvaBBwpDehkiVHq1ueHmpoNJ3kEKDs1J2OsDGC+plPeQ22ELR3SFmLpCgtT3pxJ/fiWmodr2KzgVmzAIcvMkvvk4HQgzeGzxzUTiYfRlhBIxi93r7sb8HoGFopnjiJvsRMrSoUh0TW+Hz9rWUMalWX6hKdJLzFyYvq73qCL3+E3Np/knzZf985520TAAtti7voPvYwWFBftb3L8DGNMeonkHWVyEV/pmoQZiwht4ZLLLvf9o6/3DEwxuQoIL2p/UcbalwVsR+jHG1RNrNTryfj1DJLlLrb8h1kZd5NqGhp5U+eKU35efuobttmndgHwkUfxoGX0E/ZhpiShIk9M9D+z5Lqu8fVfcTloww6mbBNK5iwFGkInHfFNdlca2ahF/YMzIbFUXr/IEOD/GPROLwNqKIQAZbviHhbVzIOrPgOe93yAYrT4nk68dfwAAA=	\N
c35f66cf-e813-4523-89c2-ef1224602254	Fish Fork	ส้อมสำหรับรับประทานปลา	cutlery	เครื่องใช้บนโต๊ะอาหาร	/fɪʃ fɔːrk/	ส้อมที่ออกแบบสำหรับรับประทานอาหารประเภทปลา โดยมีรูปทรงเหมาะกับการแยกและจับเนื้อปลา	The fish fork is used for eating fish.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.267502+07	data:image/webp;base64,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	\N
0a6a12f0-4b03-4cce-a49c-0f0669f31f99	Butter Knife	มีดทาเนย	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈbʌtər naɪf/	มีดปลายมนสำหรับตักและทาเนย แยม หรือสเปรดบนขนมปัง	Use the butter knife to spread butter on the bread.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.289255+07	data:image/webp;base64,UklGRqgEAABXRUJQVlA4IJwEAADQHgCdASqoAJsAPikUh0KhoQmtZiQMAUJaSz/0CCJGk7ZeooLf94/fdR5D3AZxPOwgKeDx62H+IH5gNIdKlOtslg83I+eTrblMrnoBT3hxqHgaAr6IBt2w7RcRQIT11ZsOsX+M/GLmB5XTTvcwf5sPzxS+FH1LByTdQ/fDMgRbHjm5APCmRrdyEOsryElDhEcBuQ2KQIY7TBaezsiC2j4RLJXLfxVNLfaNSlayfhU9ZLA+WuXnN73XwCqFAg44SohbnVNKp18OTx3GwOo4F3vrWqrzyA2Y8FNK1tsyqp7rsx3SC7vXKduq/j5ogcU3goiJhqz43Jg+mP9TxC7faoAA/vz2bhGWsUMTquEzR7sGWtWuhlIwEP7SBQWsgZVkNFimBroZCbp5FLCU7XKAn6uoopLsL0RY+CSfs2pcplwEC+NWf/IEbhIq+FdfMvyw8iv/ICIClDGASSuYzVNfwp5KqvMRnpRfz7VJdp38qT6+ink/Fig44jqBhcGzKmVqQxoFLb5slpCrBhNBbj96mHAG20mjmAJ9XGJttK0njWPYvZigmSb0UVKSP7fJcmP3HSaCk583Rl0qnAEWQzgNlpQj48+vdhmkNNFWrKo92JlRBbI41QwRf6oRnWYeOwwQKIqbynNDlkvXcTkk2mI2uqVmhPpe0ooxazVwDckbOjyuhrF2OOdmt9iYc2VMq4k2v/xyt4ZCqZqhYbO8ZrairjOsm/FJ9qAa8rpu4A/zZ/3OPX2v35tkfVZGey/4AU/Oyb8XcBbQLdOUe2OaFGpUDpWQsz66Sy0cFgrAeb273DhvklyblEccPH6gWgQegay/jxw8f116YH2a5EhPhGCTDhgvFrNRN2k/DcVmuNCRNKO43ZPQDdlMttEqZ9sLXx64WbaEOHGxByavAnx0N20RPbDObaylF4Jj1P+RTpIglOZYDEJBcOAzMAorVyBelKtDCfnTLI+oxme2fl16u0tVyJgIWWl0bLuPIJDlp3C9yqGpiWewPIQ7/4QHjNUJNS6D1/PRgxigMN2ieQ1TM0hcenvBFsko9/dvJv0sEcX9IZ+mgsS7Pvc4bDge8hzyhGPiWmfHFG0FRn0Y9+wGuUGp3V05UXIQ99+3f/cpBgKZ5j7dNM9e5JOthnVESIIdo8USp8m/fU9kiBs6FelZKsFaM4e7tY00cLH5wyrsTasHEVXg7FBtEBJgxPWKa5IIauFU4pC3UjJaVKYJ8DhkMmRFSTr7DdbSDg/ap+ai8ZzDhm48LAhO3CG1bxQVshcL3Zy1uAveiLvBbYQHcGdgBDOcWOmdrqQF7uBoxY0j3oEgUa8b3wQ7BpOqYPIveuD73Qas8cOVWZldrrS/t55abIUXdz4/Cyo1fT0jLGjXQSSMqUSpR4TCAnH5pyxdJrIeQcoggTZ27uVBTElbzRfLvcyxi8zQ0rcW+5wevjVKDr7mcOFvv7o7wYn7qZIAOwDPU5HBBiHieoxXBv4bVJJm1RYZSj2bWPDbiJMSY8hV6kJqcVmQrPMWW4Pd1lY78877I8UJFKCgK9Ce0J9d7zeRw/UEZGehz1Es1QJ4U5MAAAAA	\N
4791317d-b4b1-4292-b7a7-12e62b588c56	Soup Spoon	ช้อนซุป	cutlery	เครื่องใช้บนโต๊ะอาหาร	/suːp spuːn/	ช้อนที่มีหัวลึกสำหรับตักและรับประทานซุปหรืออาหารที่มีน้ำ	Use the soup spoon to eat the soup.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.291586+07	data:image/webp;base64,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	\N
40ab3879-8666-4b69-ab45-549958112262	Dinner Spoon	ช้อนรับประทานอาหาร	cutlery	เครื่องใช้บนโต๊ะอาหาร	/ˈdɪnər spuːn/	ช้อนขนาดมาตรฐานสำหรับใช้รับประทานอาหารในมื้อหลัก	The dinner spoon is placed next to the knife.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-10 07:16:52.29191+07	data:image/webp;base64,UklGRqoFAABXRUJQVlA4IJ4FAADQIQCdASqhAJoAPikUh0MhoQnErkIMAUJaQOwHn9xNGKV5F72jB9bOhPxGo2P9x7Sn+p5jfqD/q6aAHyzNOatS9UVLLwfMFRi9fU8AVFS4O5ken2sNH3gVeMoPvuzwCF/Rcwaa2H21d2q/D22OrLmTrBxJ6PqAQnAA9I2g4aeePmr1QRO/jHhESEQ2G4cCCj5ErGzUuTgkCuDwetfvuc4oQrQx2gV91N8oG4EmuarX3ikiTsdRRT1mt3oRJx/w2y2fT/ddaOIBMMGI1+zgxu4uEFA4wM9ORcdk8T4yL3aVB9XSVhXv+6Z3/R6l4+oHrjytby4J4MfrD6T7ylScqUm2n3rF/18pa3fO07vgS3H4ElyJ6AERtkAA/v9sf1dcHoqU2kzp7k/R8CvgeOgQetBYgIiSebh8olRw5a0Gb9pJhpkYbilHCRN7DHlgnf7+2fs7/uIcRveqf9fJVAzQXuJc4LyJEFgRz8jkYlrhQgdgRVr4TkSzTdNRvpnoGuGVFBqpQKJP73sznfXd6kC2Jfal5MTQKme4CmVba73hEIqrSmAFHz37BH2kzgAqyqH4F9YEhlRVRr+/yTiIG/PgO7R35heJaeBBt6dm1tvIKFNTywVDVkgkxG6Npld5NZTQWKNyChGc7ofbkX8V6Eq5l614+9gqqTEil3IClAQbfVjzmN8biLj/nEXKNFSFC5G5YqjGL4Y61+4UqMP8Ha86GUz0Ae2HPlvBJNHglasA/mEcnQ/ZP7U1FM1kwXxMSmfrIM/UfrIau6c5MQ61eHPzVO+c6tvriFa2Awi5RCFYyzd0xNjNQji0zzTWnMQgE+qRov8iZiptal6bYzZmOvGCbc+TH9qK3FasbaFqqED3ggM9ZscY4n2dqeWy1z9kUbkoeBaRbkmvODKcREVZtbG7BpG0/kZ+Rwm+uQ6gzsxL0aI7wIxYUiH/C9wdIVcftTJvIMFteX63AGZkxLhBBkZ4IM0KhIWB/SqU62MvXDKt85GCngsTO2g2tTbEnBNGmHB2ZiZBrbWuc0YHG2cOuEewOIWKYmAeTEN/aLWFKM4GHcVpidXVV2I35Ioe9Evs2n14ozq9OTMPTIBkXKWFP6fbM2LGpN/6SzS979vVYTITIc6KQ//qnIr1IvdicgjpXJXrxj3/HTNbjEfI/JlWhvdRFmZ4PTnqPeZDmkdE6LslXyxxgQjg1CGfCAIAl7PRnBkwNq4xcbxy5qiqqW1rbVhfBc/4le4V73uWmqjadh9g4VjV/tCsSDrfMngMBNghHesfPoze7o9BhVD5zEXj0KelDcmJdJ9muTmCfxD2plwfgASGMg14fRPice8TcZrWw717jvoGf5KvE86Rk8FX+o5VoeufYLoIFNjb77hR/CjbTlYA6ZOl14SGLI4yMRsLN74QPMD8Lgf3IjHeHbGZUPjnE7p9DJZRlQbWepZ0DiNYtijg8LRWWgiZS31N4oBd5eb7VzdjHMzTZgn7GbKM1v8FbSt6HPtCH3z8SiLyTGNuAYlnBY7VutoUT8gmpRi8/CEhul2URNTSJHyHcSb8rItGibfJ4mKSIVUnzCNN1xvDvHUZdazICIq2PzKVNv4NXVOgr4p3Dr+m5uPsWtmtmkH/Vc7QzH07hAOfOTTxZvXpVqHkp1+qwA1DP3e1PyZE6g8HC+fltWWmu8yPlV/wLRgsb/TEF1CAvYFUytQNsvYr13bNby4TPYU4DVeXWYN9YeOxltaBVq3o0b2oiZjMTlzJR88RbcUmFAq7C5z3IH1YOmQEGgb2KLZxNY168Y7zgbWE+Bz1BpyF4VhzqfzmtSiPEo5X9QufU/y7pIHZ4m9PoHwUZj25Y5/S3EfNSw7rH3VSwDR0Qg/kRBQfW2T+I6ktpQVAsVxE2tBJUon2jF6Y1L7B4MGcysVKHpURBsYAAAAA	\N
850ce136-427c-47fc-8f73-c99c317d8af8	Tea Cup	ถ้วยชา	tableware	เครื่องใช้บนโต๊ะอาหาร	/tiː kʌp/	ถ้วยสำหรับเสิร์ฟและดื่มชา มักใช้คู่กับจานรองถ้วยชา	The waiter serves tea in a tea cup.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 07:04:33.562866+07	data:image/webp;base64,UklGRnQIAABXRUJQVlA4IGgIAABwLQCdASqoAIEAPikSiEKhoSETGvVYGAKEtIBonntGeYyg/7OABdN8IQ9kofh7EgaR5PH5ZVzIZA/Lmqpvd/TVBh2YM7jHyJR8c8yP3XNYQHxOEPCkbi7uaqNXCCUKaJ8tTq0KorcDej1LQMPXngH4yVLCEelX9ygAhJyltLz08nsjSkJATdgVRffGuWgSlITog9s1P8jTMaXrzVM0b5qy/0FsOTDZizk0n9ZIEaSdvR7Up2+XpYbD8yecf9jbITTJDo1X7pvWJX897SiLs4AV9HP6K6M4gowTMzRUOYyMhZMb/ZqcJbXZ2GRqTBTT7b3KJh4IUSQTR2+bpgHgp9hk8A0L7JtdiTdtJ3n+UXuIDLCTWAblen18Ki+4ZtxvoOGDZEqrTj84R93iaS2ekvvLXc78xyC4rbAO/pI1Q1Nmqpxir33c/0W40EPNlG8bHWDBSgw5Ct0xqS9XIIsxXLH57Xu6QR62P6Jer4u0EesFCkh3DwAA/v2asVZ39NJtDaM+/4jcvK1gm6p6KyabM767wwgi9kPBuQT6dIjGq7wyEyokryr+LVmlcpkX3xq6xm0rrEx93S/0rBmv/MAWVAnqhk6rS/NE0EF43N3A/glvx9gK7/XZwfsc72OcogSmDeTiShAxKiNx++AinEOf6OAjYxAeOzqHIuij2YtL0Vc6haY0gVJT+OaKCAx82SwLRhrb6IV2QXxDvak/nbn3mLdtwkP37mvxZ0h0+ykbp/iACLMcZGdBwCGt65tqlUoR/yjU6drbPkZBUHq8/itIZQX6blzhzcBxNq7Nf9jeTlecDHWg2aFdAaeG3uwL8lVRP99pTS0QKkv4sbVjkQobzjdis3SLeztScbhA9q6CC/Sc/+V1nP01zPCbqXqNiSc8O1nsL5bU2E46FP7vbPE/ZMFQPKartRrMhX1PAxnoVg7JgWNp8vgnXR9Jc2faZdoi6byGJyVITUEWqbVxPWVCOwpPx1KoQQw8M6t5gUNEgQl6ZGKFWNwfYgbfWwrVO6qDYOYo1iJOqhOGMGCKCoqtlwHnwd0MCPiXoQeeWQXUM2jkNs5SafLyaeX0Tuv7O+1KxXDC+P+1LZxOXwszvSZOPDaPC94c2E8G5qLxrJ+tVtjOPIBpE7Sv7nP24sOhDwuFkg94vxUWVMSN7zAbHAXV1ejkcCdlgBR/OIfBg/AC0HHa9I1dACKe/Ps1s198FuxO+gqeDxyb3Gu7pO1yVICbuMyrXUqemx/wm6qwQ8+vs8XnYo4eBL4zeiWQ3gGY+XqrK9zpaa2kwmQCaz02oSx9ykM1b9kmmoU3iA7CHsP30xviv5Xp+GHpGrwAlgBlp/zdFn56XOxb/DlDV5W7SKCdWV88WsscYRtOP3/vEZMaIw7cSF14vKGimIF0bKfUoC7WZzsEOsB64n0uPxujStjO3jV3/xYJMUYObrfq3B22uzM8bCvcgjG6kCTgQfcrV5sSNw8tJ7e2alvhZ5DSwMeMwnE+/hz9jRFgqI3Tw5FK1TZFy1Fp70tZ8CR8xXbWVTOw1OxIVSSc3/Ec4KEC6Cz9debD0SzWJz/nMfJTmKGVySf151ArhxbMenkx8Lo8hfbfKD2h/niLm/dPEl5L+xWSqtBhTGBL1fOgInH/y+cEXZwNrgPPoD18e+v5kA+J3RwjHYynJhtoF3K2g3hIe9bIEPa5tPfv+U/l9eeZUCDW2ZLAKwO5h4WabMbG3Zn+d55Xn1C1kU//XCNrCF9FNp8N5rt/QNw6K2hR8Sc0jehx+z+0uSAD5cLthBPfrjZRWnm3hKNDw/x5BshLU87NF5ecHAG5djn9Q2TKogR6+Il8R12SoSEWl/oLimvbLAfrp0ykLUEu4rVcPxgJYjuLLB7V9V6SeysaSWk0Jiu8fJGyvgzDVN7MuLXxcm+zhoj4mE23UtfLPOQMiB7rPxpvJi2vYvcr+XaoT2OfljXgH+Ewcidoqr3sZl2h9ls+LFsdWoME1wDgetySV/zfKGnMKSIsEYD8lgh/G8EKBQfbEK4s6sLHoV/mQJBjRvUPZycEOefFxDtHO/wKCRBzCOPcdJU+wy4gMN6bA+sah2/Dc8t3pFz4G4nClOHk1w9js9gyKkwL15JFwp5hnMBfXvVxeRNm+0FHg4tGtNs5eCM4R7ZKEFqQdg+tuQia20UgbNd4IIwWY9E0cbtdswRpfomOJxSYqxhhRbdqK6alogt8ZDQt3McpqG37OWiJfbIXK2Rd2094BlUFbUnIlu4lrMIFjNFN82n+V0omgTTAVo6J+JuAFM70t1A8x0922UQ8fdYOkvVl8u+2U9E/OMT59eR3PfgxbVqA6RLerGKtlhiYzJJXsQeOl1b6AZ37Nwfh5WFBlgIuWU/lcc63JTIMCHg6E6PfsBMlH8cq/3Dc5KjmLxmfNBQgr75pbValjThDAIMFqtmOTEo8cFTsDpZ4c77CAOwEFuu7BbUmhR+lNuiDG3u79DweEJuvxjD69Ff6BN/vG4jxMfsfGlNfDvJVEn/+4Y5RxdHv0yFSLAPTmT9PKvtwdO2ubgIJCi4QC5f0q8HRzEwGocsONh4kIhKiEzo9pDIo0x4a7avcIlyvORX3GfCFt2qycr7OhEwARAvwXhbp+/h5vgS3wO8skp743ddQW8GL+9bIBIPQ80T7Ei4qYmJVGLr2u4hcP1glB1NhLWyslo9eVFcguFH0j8U+wIjqt6DJWOvbwlRAcDdTIBJfwaoXx5d5J0YwtDUGMA341n5TvUiZiSkUueV+syHbE7ZAlNsDAw0adKGvndQka3vojiECtaFFfS2CKWHY2hcUaFg37ABYxHNt5+gTJD7xxnJzFQv4DONEXT0wRZJWREkI6T0ZC7lFiKIdekNAAAAA	\N
71363f66-36b9-43a1-8e19-72274bd76650	Coffee Cup	ถ้วยกาแฟ	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈkɔːfi kʌp/	ถ้วยสำหรับเสิร์ฟและดื่มกาแฟร้อน โดยทั่วไปใช้คู่กับจานรอง	The coffee cup is placed on the saucer.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 07:04:33.563463+07	data:image/webp;base64,UklGRgYJAABXRUJQVlA4IPoIAACQLwCdASqnAIEAPikSh0KhoQlNgr4MAUJaQDRQwral4VRuYqnYDmb1X+IcyczH6FM33FNw+hl3RX/bFT5KhxacPIcdXjkK4CZlMK/VN+SYB8mTVj3WFIX4/jNqhQOyRO1D+i0MmMuI+gn4dIlR4n0kMxLQjcT7A/ovMTM6ku0IOtiPS71cXHoU5yZfpeDoh7RnDapatWbfNP/TP04U0ZI6q5DCfZlPR+cc6fmdLXDm+n9lM2WOcd8Uqr3MtNnBrpLUaf/tLqasJJL0RuFFc7KPOaPn0MJWZTFcLZfihzvRYis2D6WxJ0WEeQqew/2ssp+P7Of6Y/SpfaRwRFZVat3uYPScMhY9tm6zoR7fW/BbeLN+MrLUrgOUGjeOs61GNU/xfc6cHp1Hss7zwh90c5ZMWBbW0G9PLBcax5Kab0XYRqjlR5slpVE/dXD4OUM7AK24o+EOa7dlN0tr4K6t5CcWdsr6/S2u/jmZKVps48xAv3jTExdOojerPuAMk1hprQLvvRzEAAD+/iUCxCmcpXmsV5ssn19QIX7uN320kf+zvShrG3St/GeP/nYsr14yvBowdLCbDDCLNhsJd/qh4Rv4G65g4pFFKLO/dl4uKqVC9GZk2VUhASqECRXxOilzjJOLXDnthgCtIHTKYo1fFGjZl1YV860VzTgDK7M2gG8G73dshMIPQwnwngUa9G/DAtOPtafkQqVdmbbqKB0ncUpcDM05zzlEvKljqaw0WKOP6ZYdYgH4KFbZxm7sVIb/zc2tp4N4pNLpGhWQheYjiNlJEmnILqXy70sk4qMvtFdFFDobhzP1Eww9ynz3bQ/6pqJ7HEbw1Q2AKUnBDPYTI3OG7T2YOd3n8BIWI8+nMUqmMbg8O5GUV+aqmsUsuMhOtVXxfjqAY3bZUdO0zN9Io+0Y561KBBupouymgBVGaEB3uK1oRH1Fo+qOwDwse9+CRcv1z1FPPCeRoYwhCCWxRUP3vpO7LPnmJ9VZC2bYvH9aHSJTpjm/BkpbJj8YyBGXaPQCqlLl6lQ8sweoo+37ot7Xc9gzeFn8drcxJY7729myLkz/HnxRWYPC38vFCRfqeLIKzVYXrBktKdEso+oL8FZ6B1Z0ymcaUF/SyfBgTJEyk+1VEh6AWm665OJYHye01wSlBvx724I2I3rHBgoJeWrkgmv9saWKksjM5esVa/UTODIxukMhRnujaIVUpcqzdQ2T7OgCpy1Ov9kvSc68lUjkWm2Y9hD1cnaJoGcMhe3aIfQmhHyBCaGJhM41gj4zHR8PWIQQ3LmJWO8DXqcsXCXp+J/oItE7ksPmsFdN5cIBFawEK5A5kcDtiCfBK6Guz/9gyigHCWNyWLFw8tLjc2zp7HXNpphNGN3IYfTiYTcWZ18qwPM8t90M10vqDCmTS+XJ7rfaDKKHojCWcw36NTpIt3bo++C10wKt446Rj4Q5zpw0s1BsEjHIAh2ldZEpwdUT8TB+GAbTFkUuY5Vj6zw3jSh6mSw3vcRz92YhK6MPZ07Ys2i803aAUS35j1UWeX9TtizYXUYyqDt6CsgMyvvAEsJ5GjmGvS3U8PZs/cdA2VjpjysZ4wnKzOzf+bjAwRQ75eNV9uqgJvwHAQra/JO0MIOjqNkGIfapSpI5A7f4hskd67WMkC0nt3d+QhUCAFpfCnJDO4OCuAX8cwwk/RNY5zVsvF/vry9CeFVBamPtWDPe35HFp7ddDkNkvCMQPE0fKsdh8gLQuEABkDauW3+oDGp8AZfXihxkeFezqWxC4V4OF8hRQ2Iyjjqt3x8292T7Yj5Nlj/LJ8Sqo5Ti0bFNVrhCA11bNWm+Zf8fl+Rj2n9VgurTVubNgvHUlPTYVtnxUVNY0S3HU8nS06ujStMcBX8b5HAKZUu17ifjeu1o2Mhnf+lZQjK/x/gthsmKMQJH//QuFAx2OuNCEHkLR+iFNzIHDv6DC/OiAFPdJTQtirxv7kjffYeUGknMvTVKG9ARkkdC4N++7lrZAbqqJ0mf5XcW9E1oS0MDZk80mqd0Xi2vFgveZ3Ubev5DINAagsjcAi/gY0y+Qc7EKo9xrAgGuboaScYyDkFJwW1nKtglNUal4s64Z/sQwtKrFrj98OfjKwzLdgJMgqPmW1K2yCl1zaOyGuvojJNSv4hhRL9/0xsqZmGM5a7jyLf+oR4fvY0CYY32KPcg75gQVADREpySzGP1Ni2HCkzhi3vIMbOxZbbDQVW4JqXxH/vC/+0cy8aX5ClyAHF4pn/d/9Dvj6ci308sm4x9MK0h4lDGnJty79KqesJTfjZbtnhdUw5GI8ku1lhdZ/l3iBVR3eZqGAGHp/h0RZxPKsxlLwXml3LP+nGsKoBog0gGuyH2VNxdldXfqhifdM8jHr4JG40FXTUYn0TSQk64xCpfPvnEP7IvLrvxDhjRumvzkY4ApzQLUpaiotAwyoKOQoayVZ0Rm+7BhWxwpknRIgud14w60sgHWWOnN7ykZC6Y9pcLcnM3wfyD+XLJ0Uya6xwxfvT7ziNO9px+DD2/INEmgQblpcV1B0ad0K1v/dWyYpD242S4+kwDsR0VFDg2iqRgdReILjkeV3i+DsZz/Amo5+GJLn84Lv7MI9dLRLLIxvAMe+4mv1to7MEKrSkZXHIoxQcXPA8prL3R6ExEdFPL9W+59mRIWyKTKQNSsgLAH0nvKWS9PUiEEUukOpl+IGLAcISs9ZMudfuSBmldbPfUM1i3cfcKu3wRxwlPVCxUZ4goH7G7FKpgCFa33KNXyqm+2yJKk8I/4JRQB4w9hNYEsuGrGK7lvRcA89td8EUNWwqF9glt4OkraQwMn8TTKB/l9SJK3ElKzW5P3Fv2OXBH49X8IGON71RNRwDDgeuOhVX6y6fK9gmQNjg+Q3X+1LvrgwBbh4KtSu5LkEnTb/zHIyjLoraqn1r9jDiEMs16jztOoUYS5iVQ9HX/UqAJ4LZ5+JY2ARey5tp80eY2u8z5nfB+FYBAVE2CXaGta40vglNQn4mn4J9rBnED83MN/7Ngc9ltu+qSk905YefgnpuEheZBz1QpwTgCcE6EbgMzAAA=	\N
0c18e638-0edf-4850-b268-5da75f7947a6	Saucer	จานรองถ้วย	tableware	เครื่องใช้บนโต๊ะอาหาร	/ˈsɔːsər/	จานขนาดเล็กสำหรับรองถ้วยชา กาแฟ หรือเครื่องดื่มร้อน และใช้รองป้องกันของเหลวหกบนโต๊ะ	The cup is placed on the saucer.	\N	\N	2026-08-26 19:02:22.318127+07	2026-09-09 07:04:33.564697+07	data:image/webp;base64,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	\N
\.


--
-- Name: ai_provider_settings ai_provider_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ai_provider_settings
    ADD CONSTRAINT ai_provider_settings_pkey PRIMARY KEY (provider);


--
-- Name: ai_scan_items ai_scan_items_name_en_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ai_scan_items
    ADD CONSTRAINT ai_scan_items_name_en_key UNIQUE (name_en);


--
-- Name: ai_scan_items ai_scan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ai_scan_items
    ADD CONSTRAINT ai_scan_items_pkey PRIMARY KEY (id);


--
-- Name: api_rate_limits api_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.api_rate_limits
    ADD CONSTRAINT api_rate_limits_pkey PRIMARY KEY (bucket_key);


--
-- Name: app_users app_users_email_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_email_key UNIQUE (email);


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: ar_items ar_items_name_en_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ar_items
    ADD CONSTRAINT ar_items_name_en_key UNIQUE (name_en);


--
-- Name: ar_items ar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ar_items
    ADD CONSTRAINT ar_items_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_student_id_key UNIQUE (assignment_id, student_id);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: certificate_events certificate_events_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificate_events
    ADD CONSTRAINT certificate_events_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_certificate_code_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_code_key UNIQUE (certificate_code);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_student_id_certificate_type_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_student_id_certificate_type_key UNIQUE (student_id, certificate_type);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: class_invites class_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_invites
    ADD CONSTRAINT class_invites_pkey PRIMARY KEY (short_code);


--
-- Name: class_students class_students_class_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_class_id_student_id_key UNIQUE (class_id, student_id);


--
-- Name: class_students class_students_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: content_library content_library_content_type_name_en_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.content_library
    ADD CONSTRAINT content_library_content_type_name_en_key UNIQUE (content_type, name_en);


--
-- Name: content_library content_library_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.content_library
    ADD CONSTRAINT content_library_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- Name: fine_lesson_plans fine_lesson_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.fine_lesson_plans
    ADD CONSTRAINT fine_lesson_plans_pkey PRIMARY KEY (id);


--
-- Name: generated_model_assets generated_model_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.generated_model_assets
    ADD CONSTRAINT generated_model_assets_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (provider);


--
-- Name: learning_analytics learning_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_analytics
    ADD CONSTRAINT learning_analytics_pkey PRIMARY KEY (id);


--
-- Name: learning_analytics learning_analytics_student_id_course_id_date_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_analytics
    ADD CONSTRAINT learning_analytics_student_id_course_id_date_key UNIQUE (student_id, course_id, date);


--
-- Name: learning_events learning_events_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_events
    ADD CONSTRAINT learning_events_pkey PRIMARY KEY (id);


--
-- Name: learning_events learning_events_student_id_event_type_reference_type_refere_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_events
    ADD CONSTRAINT learning_events_student_id_event_type_reference_type_refere_key UNIQUE (student_id, event_type, reference_type, reference_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_student_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_id_lesson_id_key UNIQUE (student_id, lesson_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: model_generation_jobs model_generation_jobs_external_task_id_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.model_generation_jobs
    ADD CONSTRAINT model_generation_jobs_external_task_id_key UNIQUE (external_task_id);


--
-- Name: model_generation_jobs model_generation_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.model_generation_jobs
    ADD CONSTRAINT model_generation_jobs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (migration_name);


--
-- Name: schools schools_name_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_name_key UNIQUE (name);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: simulation_scenarios simulation_scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.simulation_scenarios
    ADD CONSTRAINT simulation_scenarios_pkey PRIMARY KEY (id);


--
-- Name: simulation_sessions simulation_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.simulation_sessions
    ADD CONSTRAINT simulation_sessions_pkey PRIMARY KEY (id);


--
-- Name: stored_files stored_files_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.stored_files
    ADD CONSTRAINT stored_files_pkey PRIMARY KEY (id);


--
-- Name: stored_files stored_files_storage_name_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.stored_files
    ADD CONSTRAINT stored_files_storage_name_key UNIQUE (storage_name);


--
-- Name: student_assessments student_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT student_assessments_pkey PRIMARY KEY (id);


--
-- Name: system_announcements system_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.system_announcements
    ADD CONSTRAINT system_announcements_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: uploaded_assets uploaded_assets_file_name_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.uploaded_assets
    ADD CONSTRAINT uploaded_assets_file_name_key UNIQUE (file_name);


--
-- Name: uploaded_assets uploaded_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.uploaded_assets
    ADD CONSTRAINT uploaded_assets_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_items vocabulary_items_name_en_key; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.vocabulary_items
    ADD CONSTRAINT vocabulary_items_name_en_key UNIQUE (name_en);


--
-- Name: vocabulary_items vocabulary_items_pkey; Type: CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.vocabulary_items
    ADD CONSTRAINT vocabulary_items_pkey PRIMARY KEY (id);


--
-- Name: idx_ai_provider_single_active; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE UNIQUE INDEX idx_ai_provider_single_active ON public.ai_provider_settings USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_api_rate_limits_expires; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_api_rate_limits_expires ON public.api_rate_limits USING btree (expires_at);


--
-- Name: idx_ar_items_creator_updated; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_ar_items_creator_updated ON public.ar_items USING btree (created_by, updated_at DESC);


--
-- Name: idx_assignment_submissions_assignment; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_assignment_submissions_assignment ON public.assignment_submissions USING btree (assignment_id, submitted_at DESC);


--
-- Name: idx_assignments_class_due; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_assignments_class_due ON public.assignments USING btree (class_id, due_date DESC);


--
-- Name: idx_assignments_lesson_plan; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_assignments_lesson_plan ON public.assignments USING btree (lesson_plan_id);


--
-- Name: idx_assignments_teacher_due; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_assignments_teacher_due ON public.assignments USING btree (teacher_id, due_date DESC);


--
-- Name: idx_audit_logs_action_created; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_audit_logs_action_created ON public.audit_logs USING btree (action, created_at DESC);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at DESC, actor_id);


--
-- Name: idx_audit_logs_entity_created; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_audit_logs_entity_created ON public.audit_logs USING btree (entity_type, created_at DESC);


--
-- Name: idx_certificate_events_certificate_created; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_certificate_events_certificate_created ON public.certificate_events USING btree (certificate_id, created_at DESC);


--
-- Name: idx_certificates_student; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_certificates_student ON public.certificates USING btree (student_id, issued_at DESC);


--
-- Name: idx_chat_sessions_started_at; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_chat_sessions_started_at ON public.chat_sessions USING btree (started_at DESC);


--
-- Name: idx_chat_sessions_student; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_chat_sessions_student ON public.chat_sessions USING btree (student_id, started_at DESC);


--
-- Name: idx_class_invites_class_active; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_class_invites_class_active ON public.class_invites USING btree (class_id, expires_at) WHERE (revoked_at IS NULL);


--
-- Name: idx_class_students_student; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_class_students_student ON public.class_students USING btree (student_id, enrolled_at DESC);


--
-- Name: idx_classes_teacher_active; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_classes_teacher_active ON public.classes USING btree (teacher_id, is_active, created_at DESC);


--
-- Name: idx_content_library_type_status; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_content_library_type_status ON public.content_library USING btree (content_type, status);


--
-- Name: idx_courses_published; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_courses_published ON public.courses USING btree (is_published);


--
-- Name: idx_fine_lesson_plans_class_published; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_fine_lesson_plans_class_published ON public.fine_lesson_plans USING btree (class_id, publication_status, updated_at DESC);


--
-- Name: idx_learning_analytics_date; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_learning_analytics_date ON public.learning_analytics USING btree (date DESC);


--
-- Name: idx_learning_analytics_student_date; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_learning_analytics_student_date ON public.learning_analytics USING btree (student_id, date DESC);


--
-- Name: idx_learning_events_student_occurred; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_learning_events_student_occurred ON public.learning_events USING btree (student_id, occurred_at DESC);


--
-- Name: idx_lesson_progress_status; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_lesson_progress_status ON public.lesson_progress USING btree (status);


--
-- Name: idx_lesson_progress_student_updated; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_lesson_progress_student_updated ON public.lesson_progress USING btree (student_id, updated_at DESC);


--
-- Name: idx_lesson_progress_updated_at; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_lesson_progress_updated_at ON public.lesson_progress USING btree (updated_at DESC);


--
-- Name: idx_model_generation_jobs_creator_updated; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_model_generation_jobs_creator_updated ON public.model_generation_jobs USING btree (created_by, updated_at DESC);


--
-- Name: idx_model_generation_jobs_status_updated; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_model_generation_jobs_status_updated ON public.model_generation_jobs USING btree (status, updated_at DESC);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_password_reset_tokens_user_active; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_password_reset_tokens_user_active ON public.password_reset_tokens USING btree (user_id, expires_at DESC) WHERE (used_at IS NULL);


--
-- Name: idx_profiles_created_at; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_profiles_created_at ON public.profiles USING btree (created_at DESC);


--
-- Name: idx_profiles_role_status; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_profiles_role_status ON public.profiles USING btree (role, approval_status);


--
-- Name: idx_simulation_sessions_completed_at; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_simulation_sessions_completed_at ON public.simulation_sessions USING btree (completed_at DESC);


--
-- Name: idx_simulation_sessions_student; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_simulation_sessions_student ON public.simulation_sessions USING btree (student_id);


--
-- Name: idx_simulation_sessions_student_completed; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_simulation_sessions_student_completed ON public.simulation_sessions USING btree (student_id, completed_at DESC);


--
-- Name: idx_stored_files_owner; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_stored_files_owner ON public.stored_files USING btree (owner_id, created_at DESC);


--
-- Name: idx_student_assessments_student_submitted; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_student_assessments_student_submitted ON public.student_assessments USING btree (student_id, submitted_at DESC);


--
-- Name: idx_student_assessments_submitted_at; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_student_assessments_submitted_at ON public.student_assessments USING btree (submitted_at DESC);


--
-- Name: idx_system_announcements_published; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_system_announcements_published ON public.system_announcements USING btree (published_at DESC);


--
-- Name: idx_uploaded_assets_filename; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_uploaded_assets_filename ON public.uploaded_assets USING btree (file_name);


--
-- Name: idx_vocab_category; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_vocab_category ON public.vocabulary_items USING btree (category);


--
-- Name: idx_vocab_creator_updated; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_vocab_creator_updated ON public.vocabulary_items USING btree (created_by, updated_at DESC);


--
-- Name: idx_vocab_name_en; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_vocab_name_en ON public.vocabulary_items USING btree (name_en);


--
-- Name: idx_vocab_updated; Type: INDEX; Schema: public; Owner: 3designs
--

CREATE INDEX idx_vocab_updated ON public.vocabulary_items USING btree (updated_at DESC);


--
-- Name: ai_provider_settings ai_provider_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ai_provider_settings
    ADD CONSTRAINT ai_provider_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- Name: ar_items ar_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.ar_items
    ADD CONSTRAINT ar_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: assessments assessments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: assessments assessments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: assessments assessments_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: assignments assignments_lesson_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_lesson_plan_id_fkey FOREIGN KEY (lesson_plan_id) REFERENCES public.fine_lesson_plans(id) ON DELETE SET NULL;


--
-- Name: assignments assignments_scenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.simulation_scenarios(id);


--
-- Name: assignments assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id);


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: certificate_events certificate_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificate_events
    ADD CONSTRAINT certificate_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: certificate_events certificate_events_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificate_events
    ADD CONSTRAINT certificate_events_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.certificates(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: class_invites class_invites_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_invites
    ADD CONSTRAINT class_invites_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: class_invites class_invites_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_invites
    ADD CONSTRAINT class_invites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: class_students class_students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: class_students class_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: classes classes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: classes classes_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id);


--
-- Name: content_library content_library_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.content_library
    ADD CONSTRAINT content_library_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: courses courses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: enrollments enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: fine_lesson_plans fine_lesson_plans_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.fine_lesson_plans
    ADD CONSTRAINT fine_lesson_plans_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- Name: fine_lesson_plans fine_lesson_plans_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.fine_lesson_plans
    ADD CONSTRAINT fine_lesson_plans_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: generated_model_assets generated_model_assets_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.generated_model_assets
    ADD CONSTRAINT generated_model_assets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: integration_settings integration_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: learning_analytics learning_analytics_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_analytics
    ADD CONSTRAINT learning_analytics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: learning_analytics learning_analytics_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_analytics
    ADD CONSTRAINT learning_analytics_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: learning_events learning_events_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.learning_events
    ADD CONSTRAINT learning_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE;


--
-- Name: model_generation_jobs model_generation_jobs_ar_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.model_generation_jobs
    ADD CONSTRAINT model_generation_jobs_ar_item_id_fkey FOREIGN KEY (ar_item_id) REFERENCES public.ar_items(id) ON DELETE SET NULL;


--
-- Name: model_generation_jobs model_generation_jobs_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.model_generation_jobs
    ADD CONSTRAINT model_generation_jobs_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.generated_model_assets(id) ON DELETE SET NULL;


--
-- Name: model_generation_jobs model_generation_jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.model_generation_jobs
    ADD CONSTRAINT model_generation_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);


--
-- Name: simulation_scenarios simulation_scenarios_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.simulation_scenarios
    ADD CONSTRAINT simulation_scenarios_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: simulation_sessions simulation_sessions_lesson_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.simulation_sessions
    ADD CONSTRAINT simulation_sessions_lesson_plan_id_fkey FOREIGN KEY (lesson_plan_id) REFERENCES public.fine_lesson_plans(id) ON DELETE SET NULL;


--
-- Name: simulation_sessions simulation_sessions_scenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.simulation_sessions
    ADD CONSTRAINT simulation_sessions_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.simulation_scenarios(id);


--
-- Name: simulation_sessions simulation_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.simulation_sessions
    ADD CONSTRAINT simulation_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: stored_files stored_files_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.stored_files
    ADD CONSTRAINT stored_files_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: stored_files stored_files_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.stored_files
    ADD CONSTRAINT stored_files_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: student_assessments student_assessments_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT student_assessments_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: student_assessments student_assessments_graded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT student_assessments_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.profiles(id);


--
-- Name: student_assessments student_assessments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT student_assessments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: system_announcements system_announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.system_announcements
    ADD CONSTRAINT system_announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: units units_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: uploaded_assets uploaded_assets_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: 3designs
--

ALTER TABLE ONLY public.uploaded_assets
    ADD CONSTRAINT uploaded_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: vocabulary_items Allow public read vocabulary_items; Type: POLICY; Schema: public; Owner: 3designs
--

CREATE POLICY "Allow public read vocabulary_items" ON public.vocabulary_items FOR SELECT USING (true);


--
-- Name: vocabulary_items; Type: ROW SECURITY; Schema: public; Owner: 3designs
--

ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict 1AVVSBGq6dZu14lofVuO2rGZH2yKbYYkpHWQEg6qDpCTae1E1dYwvsaPfQSacLF

