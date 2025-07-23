--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_chat_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_chat_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    is_online boolean DEFAULT false,
    away_message text,
    notifications_enabled boolean DEFAULT true,
    auto_response_enabled boolean DEFAULT true,
    working_hours_start character varying(5) DEFAULT '09:00'::character varying,
    working_hours_end character varying(5) DEFAULT '17:00'::character varying,
    weekend_available boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_chat_settings OWNER TO neondb_owner;

--
-- Name: admin_chat_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_chat_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_chat_settings_id_seq OWNER TO neondb_owner;

--
-- Name: admin_chat_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_chat_settings_id_seq OWNED BY public.admin_chat_settings.id;


--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_sessions (
    id text NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_sessions OWNER TO neondb_owner;

--
-- Name: ai_consultations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_consultations (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    company text,
    industry text,
    business_size text,
    current_ai_usage text,
    ai_interests text[],
    project_timeline text,
    budget text,
    project_description text NOT NULL,
    preferred_contact_time text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_consultations OWNER TO neondb_owner;

--
-- Name: ai_consultations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_consultations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_consultations_id_seq OWNER TO neondb_owner;

--
-- Name: ai_consultations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_consultations_id_seq OWNED BY public.ai_consultations.id;


--
-- Name: blocked_countries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blocked_countries (
    id integer NOT NULL,
    country_code character varying(2) NOT NULL,
    country_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blocked_countries OWNER TO neondb_owner;

--
-- Name: blocked_countries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.blocked_countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blocked_countries_id_seq OWNER TO neondb_owner;

--
-- Name: blocked_countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.blocked_countries_id_seq OWNED BY public.blocked_countries.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    session_id integer NOT NULL,
    sender character varying(20) NOT NULL,
    sender_name character varying(255),
    message text NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying,
    metadata text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_messages OWNER TO neondb_owner;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_messages_id_seq OWNER TO neondb_owner;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_sessions (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    customer_name character varying(255),
    customer_email character varying(255),
    customer_phone character varying(20),
    status character varying(20) DEFAULT 'active'::character varying,
    is_human_transfer boolean DEFAULT false,
    transferred_at timestamp without time zone,
    closed_at timestamp without time zone,
    admin_user_id integer,
    last_message_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_sessions OWNER TO neondb_owner;

--
-- Name: chat_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.chat_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: chat_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.chat_sessions_id_seq OWNED BY public.chat_sessions.id;


--
-- Name: color_palette; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.color_palette (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hex_value character varying(7) NOT NULL,
    description text,
    category character varying(50) DEFAULT 'general'::character varying,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.color_palette OWNER TO neondb_owner;

--
-- Name: color_palette_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.color_palette_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.color_palette_id_seq OWNER TO neondb_owner;

--
-- Name: color_palette_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.color_palette_id_seq OWNED BY public.color_palette.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    company text,
    service text,
    employees text,
    challenges text,
    contact_time text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: country_blocking; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.country_blocking (
    id integer NOT NULL,
    is_enabled boolean DEFAULT false,
    block_message text DEFAULT 'This service is not available in your region.'::text,
    message_title text DEFAULT 'Service Not Available'::text,
    font_size character varying(50) DEFAULT 'text-lg'::character varying,
    font_color character varying(7) DEFAULT '#374151'::character varying,
    background_color character varying(7) DEFAULT '#f9fafb'::character varying,
    border_color character varying(7) DEFAULT '#e5e7eb'::character varying,
    show_contact_info boolean DEFAULT true,
    contact_message text DEFAULT 'If you believe this is an error, please contact us.'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.country_blocking OWNER TO neondb_owner;

--
-- Name: country_blocking_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.country_blocking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.country_blocking_id_seq OWNER TO neondb_owner;

--
-- Name: country_blocking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.country_blocking_id_seq OWNED BY public.country_blocking.id;


--
-- Name: exit_intent_popup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.exit_intent_popup (
    id integer NOT NULL,
    title text DEFAULT 'Wait! Don''t Leave Yet'::text NOT NULL,
    message text DEFAULT 'Get a free IT consultation before you go! Our experts are standing by to help with your technology needs.'::text NOT NULL,
    button_text text DEFAULT 'Get Free Consultation'::text NOT NULL,
    button_url text DEFAULT '/contact'::text NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    background_color text DEFAULT '#ffffff'::text NOT NULL,
    text_color text DEFAULT '#000000'::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    button_color text DEFAULT '#2563eb'::text NOT NULL
);


ALTER TABLE public.exit_intent_popup OWNER TO neondb_owner;

--
-- Name: exit_intent_popup_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.exit_intent_popup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exit_intent_popup_id_seq OWNER TO neondb_owner;

--
-- Name: exit_intent_popup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.exit_intent_popup_id_seq OWNED BY public.exit_intent_popup.id;


--
-- Name: footer_links; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.footer_links (
    id integer NOT NULL,
    section character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    url text NOT NULL,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    target character varying(10) DEFAULT '_self'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.footer_links OWNER TO neondb_owner;

--
-- Name: footer_links_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.footer_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.footer_links_id_seq OWNER TO neondb_owner;

--
-- Name: footer_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.footer_links_id_seq OWNED BY public.footer_links.id;


--
-- Name: it_consultations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.it_consultations (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    company character varying(255),
    employees character varying(100),
    services text[] NOT NULL,
    urgency character varying(100),
    budget character varying(100),
    challenges text NOT NULL,
    preferred_contact_time character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.it_consultations OWNER TO neondb_owner;

--
-- Name: it_consultations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.it_consultations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.it_consultations_id_seq OWNER TO neondb_owner;

--
-- Name: it_consultations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.it_consultations_id_seq OWNED BY public.it_consultations.id;


--
-- Name: knowledge_base_articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_base_articles (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    category_id integer,
    tags text[],
    is_published boolean DEFAULT true,
    view_count integer DEFAULT 0,
    order_index integer DEFAULT 0,
    meta_title text,
    meta_description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.knowledge_base_articles OWNER TO neondb_owner;

--
-- Name: knowledge_base_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.knowledge_base_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_articles_id_seq OWNER TO neondb_owner;

--
-- Name: knowledge_base_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.knowledge_base_articles_id_seq OWNED BY public.knowledge_base_articles.id;


--
-- Name: knowledge_base_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_base_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.knowledge_base_categories OWNER TO neondb_owner;

--
-- Name: knowledge_base_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.knowledge_base_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_categories_id_seq OWNER TO neondb_owner;

--
-- Name: knowledge_base_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.knowledge_base_categories_id_seq OWNED BY public.knowledge_base_categories.id;


--
-- Name: media_files; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.media_files (
    id integer NOT NULL,
    file_name text NOT NULL,
    original_name text NOT NULL,
    mime_type text NOT NULL,
    file_size integer NOT NULL,
    file_path text NOT NULL,
    url text NOT NULL,
    alt_text text,
    caption text,
    uploaded_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    s3_url text,
    is_backed_up boolean DEFAULT false,
    description text,
    tags text[],
    folder text DEFAULT ''::text,
    image_width integer,
    image_height integer,
    is_public boolean DEFAULT true,
    download_count integer DEFAULT 0,
    uploaded_by text
);


ALTER TABLE public.media_files OWNER TO neondb_owner;

--
-- Name: media_files_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.media_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_files_id_seq OWNER TO neondb_owner;

--
-- Name: media_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.media_files_id_seq OWNED BY public.media_files.id;


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    label text NOT NULL,
    href text,
    parent_id integer,
    order_index integer DEFAULT 0 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.menu_items OWNER TO neondb_owner;

--
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO neondb_owner;

--
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- Name: page_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.page_content (
    id integer NOT NULL,
    page character varying(100) NOT NULL,
    section character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    image_url character varying(500),
    image_alt character varying(255),
    display_order integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.page_content OWNER TO neondb_owner;

--
-- Name: page_content_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.page_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.page_content_id_seq OWNER TO neondb_owner;

--
-- Name: page_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.page_content_id_seq OWNED BY public.page_content.id;


--
-- Name: pricing_calculations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pricing_calculations (
    id integer NOT NULL,
    session_id character varying(100),
    customer_name character varying(100),
    customer_email character varying(150),
    customer_phone character varying(20),
    company_name character varying(150),
    selected_services jsonb NOT NULL,
    total_estimate numeric(10,2) NOT NULL,
    estimate_breakdown jsonb,
    urgency_level character varying(20) DEFAULT 'normal'::character varying,
    project_description text,
    preferred_contact_method character varying(20) DEFAULT 'email'::character varying,
    is_converted boolean DEFAULT false,
    conversion_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pricing_calculations OWNER TO neondb_owner;

--
-- Name: pricing_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pricing_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_calculations_id_seq OWNER TO neondb_owner;

--
-- Name: pricing_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pricing_calculations_id_seq OWNED BY public.pricing_calculations.id;


--
-- Name: quick_quotes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quick_quotes (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quick_quotes OWNER TO neondb_owner;

--
-- Name: quick_quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quick_quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quick_quotes_id_seq OWNER TO neondb_owner;

--
-- Name: quick_quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quick_quotes_id_seq OWNED BY public.quick_quotes.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    customer_name text NOT NULL,
    rating integer NOT NULL,
    review_text text NOT NULL,
    business_name text,
    location text,
    date_posted timestamp without time zone DEFAULT now(),
    is_visible boolean DEFAULT true NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_alerts (
    id integer NOT NULL,
    is_enabled boolean DEFAULT true,
    title character varying(255) DEFAULT 'CRITICAL'::character varying NOT NULL,
    message text DEFAULT 'Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats'::text NOT NULL,
    button_text character varying(100) DEFAULT 'Learn More'::character varying NOT NULL,
    button_link character varying(255) DEFAULT '/windows10-upgrade'::character varying NOT NULL,
    background_color character varying(50) DEFAULT '#dc2626'::character varying NOT NULL,
    text_color character varying(50) DEFAULT '#ffffff'::character varying NOT NULL,
    icon_type character varying(50) DEFAULT 'AlertTriangle'::character varying NOT NULL,
    mobile_title character varying(255) DEFAULT 'CRITICAL SECURITY ALERT'::character varying NOT NULL,
    mobile_subtitle character varying(255) DEFAULT 'Windows 10 Support Ending'::character varying NOT NULL,
    mobile_description text DEFAULT 'Your Systems Will Become Vulnerable to New Threats. Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates, leaving them exposed to new cyber threats.'::text NOT NULL,
    mobile_button_text character varying(100) DEFAULT 'Get Protected Now'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    button_background_color character varying(50) DEFAULT '#ffffff'::character varying NOT NULL,
    button_text_color character varying(50) DEFAULT '#000000'::character varying NOT NULL,
    is_desktop_enabled boolean DEFAULT true,
    is_mobile_enabled boolean DEFAULT true,
    desktop_title character varying(255) DEFAULT 'CRITICAL'::character varying NOT NULL,
    desktop_message text DEFAULT 'Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats'::text NOT NULL,
    desktop_button_text character varying(100) DEFAULT 'Learn More'::character varying NOT NULL,
    desktop_button_link character varying(255) DEFAULT '/windows10-upgrade'::character varying NOT NULL,
    desktop_background_color character varying(50) DEFAULT '#dc2626'::character varying NOT NULL,
    desktop_text_color character varying(50) DEFAULT '#ffffff'::character varying NOT NULL,
    desktop_button_background_color character varying(50) DEFAULT '#ffffff'::character varying NOT NULL,
    desktop_button_text_color character varying(50) DEFAULT '#000000'::character varying NOT NULL,
    desktop_icon_type character varying(50) DEFAULT 'AlertTriangle'::character varying NOT NULL,
    mobile_button_link character varying(255) DEFAULT '/windows10-upgrade'::character varying NOT NULL,
    mobile_background_color character varying(50) DEFAULT '#dc2626'::character varying NOT NULL,
    mobile_text_color character varying(50) DEFAULT '#ffffff'::character varying NOT NULL,
    mobile_button_background_color character varying(50) DEFAULT '#ffffff'::character varying NOT NULL,
    mobile_button_text_color character varying(50) DEFAULT '#000000'::character varying NOT NULL,
    mobile_icon_type character varying(50) DEFAULT 'AlertTriangle'::character varying NOT NULL
);


ALTER TABLE public.security_alerts OWNER TO neondb_owner;

--
-- Name: security_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.security_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.security_alerts_id_seq OWNER TO neondb_owner;

--
-- Name: security_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.security_alerts_id_seq OWNED BY public.security_alerts.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    base_price numeric(10,2) DEFAULT 0.00,
    hourly_rate numeric(10,2),
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_categories OWNER TO neondb_owner;

--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_categories_id_seq OWNER TO neondb_owner;

--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: service_options; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_options (
    id integer NOT NULL,
    category_id integer,
    name character varying(150) NOT NULL,
    description text,
    price_modifier numeric(10,2) DEFAULT 0.00,
    price_type character varying(20) DEFAULT 'fixed'::character varying,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_options OWNER TO neondb_owner;

--
-- Name: service_options_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_options_id_seq OWNER TO neondb_owner;

--
-- Name: service_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_options_id_seq OWNED BY public.service_options.id;


--
-- Name: static_services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.static_services (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    price character varying(100) NOT NULL,
    setup_fee character varying(100),
    icon character varying(50) DEFAULT 'server'::character varying,
    button_text character varying(100) DEFAULT 'Order Service'::character varying,
    button_url character varying(500) NOT NULL,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    button_color character varying(7) DEFAULT '#2563eb'::character varying
);


ALTER TABLE public.static_services OWNER TO neondb_owner;

--
-- Name: static_services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.static_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.static_services_id_seq OWNER TO neondb_owner;

--
-- Name: static_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.static_services_id_seq OWNED BY public.static_services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    two_factor_secret text,
    two_factor_enabled boolean DEFAULT false,
    backup_codes text[]
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admin_chat_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_chat_settings ALTER COLUMN id SET DEFAULT nextval('public.admin_chat_settings_id_seq'::regclass);


--
-- Name: ai_consultations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_consultations ALTER COLUMN id SET DEFAULT nextval('public.ai_consultations_id_seq'::regclass);


--
-- Name: blocked_countries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_countries ALTER COLUMN id SET DEFAULT nextval('public.blocked_countries_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: chat_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_sessions ALTER COLUMN id SET DEFAULT nextval('public.chat_sessions_id_seq'::regclass);


--
-- Name: color_palette id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.color_palette ALTER COLUMN id SET DEFAULT nextval('public.color_palette_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: country_blocking id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.country_blocking ALTER COLUMN id SET DEFAULT nextval('public.country_blocking_id_seq'::regclass);


--
-- Name: exit_intent_popup id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exit_intent_popup ALTER COLUMN id SET DEFAULT nextval('public.exit_intent_popup_id_seq'::regclass);


--
-- Name: footer_links id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.footer_links ALTER COLUMN id SET DEFAULT nextval('public.footer_links_id_seq'::regclass);


--
-- Name: it_consultations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.it_consultations ALTER COLUMN id SET DEFAULT nextval('public.it_consultations_id_seq'::regclass);


--
-- Name: knowledge_base_articles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_articles ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_articles_id_seq'::regclass);


--
-- Name: knowledge_base_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_categories ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_categories_id_seq'::regclass);


--
-- Name: media_files id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_files ALTER COLUMN id SET DEFAULT nextval('public.media_files_id_seq'::regclass);


--
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- Name: page_content id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.page_content ALTER COLUMN id SET DEFAULT nextval('public.page_content_id_seq'::regclass);


--
-- Name: pricing_calculations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_calculations ALTER COLUMN id SET DEFAULT nextval('public.pricing_calculations_id_seq'::regclass);


--
-- Name: quick_quotes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quick_quotes ALTER COLUMN id SET DEFAULT nextval('public.quick_quotes_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: security_alerts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_alerts ALTER COLUMN id SET DEFAULT nextval('public.security_alerts_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: service_options id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_options ALTER COLUMN id SET DEFAULT nextval('public.service_options_id_seq'::regclass);


--
-- Name: static_services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.static_services ALTER COLUMN id SET DEFAULT nextval('public.static_services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admin_chat_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_chat_settings (id, user_id, is_online, away_message, notifications_enabled, auto_response_enabled, working_hours_start, working_hours_end, weekend_available, updated_at) FROM stdin;
1	4	t	\N	t	t	09:00	17:00	f	2025-06-27 21:58:20.742
\.


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_sessions (id, user_id, expires_at, created_at) FROM stdin;
9d6e0e9bed9e1d1783ffe670792b23429be018ca027e6c45db850d465cc2e2d6	4	2025-06-27 06:22:12.417	2025-06-26 06:22:12.431907
59e4da4c55873840512dbf3d7f2df915b6b13e787539c513a34c646d3727e0e6	4	2025-06-27 06:25:26.889	2025-06-26 06:25:26.905296
fba03c0487bb3070f76f336c47955376e4cd0a9808dba874f4d10b43ec2b0ea1	4	2025-06-27 12:38:58.768	2025-06-26 12:38:58.79332
b3bfc76838813e36aa702ef5c5ee2dcba32118c1525311c930b2cd631e3797e6	4	2025-06-27 12:48:58.844	2025-06-26 12:48:58.859827
525dbbcdde60d27b146a23cb3bafcec228b3be926ed792ca4fba368216d148f6	4	2025-06-27 12:58:53.104	2025-06-26 12:58:53.120032
1bb0bbe24717d81e3e3695dce8023c0b2113841541df4ae7d8c015384e883362	4	2025-06-27 13:02:27.553	2025-06-26 13:02:27.568663
4b4a8b11db564c96c2914d73f5560161ecb9354461c3c08ecf5b183c4e2360cf	4	2025-06-27 13:07:46.273	2025-06-26 13:07:46.28931
88fae32d53d26b62b522757943a94d9d325b52616ac1341959d11f793a57f2df	4	2025-06-27 15:49:17.578	2025-06-26 15:49:17.59187
54d552ce062db507fab8bb31dc53f98fb9fdfe43a28dacf4b056804124b4ac34	4	2025-06-27 19:30:23.759	2025-06-26 19:30:23.774456
302fd1d074925e4ce3a606aae710ee6b4ad558010b14e8213b00c374cb5dacce	4	2025-06-27 21:07:06.637	2025-06-26 21:07:06.652271
7d706d73587e7119b42a42251bbfa0249512c5cf45ca5b3808652c2daf26ee3d	4	2025-06-27 21:11:34.066	2025-06-26 21:11:34.083845
2ca19fe524ce65b5ca2faef7f1faf7c85473ce4858061ebd06c83c8255db9001	4	2025-06-27 21:14:06.6	2025-06-26 21:14:06.615808
3352a9f2d763eafac7ababa05a50f5eea9b67a4949f883a32ac4738f5e1db06e	4	2025-06-27 21:17:03.144	2025-06-26 21:17:03.158511
4c828181c5ac543c01bd3a1fbf27e4de10b35cc25a314b11f2274800a8eea3a1	4	2025-06-27 21:26:14.14	2025-06-26 21:26:14.155413
75781574df0036b410f390a9920cd47f23448ff2366a44d283cd71cdcf9f6f4f	4	2025-06-27 21:31:36.16	2025-06-26 21:31:36.17631
aae907e4228409a80247a1f096a50b24d2ec44cf5eb71f5315b3115423ff3b8b	4	2025-06-27 21:36:31.871	2025-06-26 21:36:31.88744
dc8da79f1066c2361147b5e70d4c1a1f3ddeef0bf1775b617d87a1b2b13bc1ed	4	2025-06-27 21:38:12.164	2025-06-26 21:38:12.178681
5af94ba16f7b90df9e2fe3780a3ca1ceabdf8b1957edaf56ebfa9c1fe0a1105e	4	2025-06-27 21:42:02.55	2025-06-26 21:42:02.565963
5c756f6b06825a90bd370f6eb63b3c2b520258b61d551d23a47d37df7eaf7ce5	4	2025-06-27 21:43:59.218	2025-06-26 21:43:59.232422
c8a16605f24c44af9011bb08b390e5bf6ee4178c56155865f22d3a238af33300	4	2025-06-27 21:44:43.986	2025-06-26 21:44:44.000463
35247c6b012bf986e503ba29a6f92abb4648a4ef51db2c494fc0390342fd1c16	4	2025-06-27 23:42:40.082	2025-06-26 23:42:40.102939
daf7ae09148be6f5829f91d1f33ac13a0fa384cd18ce0812d542616531f6ef6c	4	2025-06-27 23:56:19.02	2025-06-26 23:56:19.035785
069ef33aa22363a2925bc866f20431ae6ce163faac65bd15d58a4d03a4d7de14	4	2025-06-28 00:11:22.546	2025-06-27 00:11:22.567403
0edcd8afa9de5add3fe1a978f0597432999ea6177f9e041808c4ed850a1bc190	4	2025-06-28 02:44:01.679	2025-06-27 02:44:01.694626
9a3d8649140291378f8668bc524b82b1b0881fab83203c616db1c0c827223f9b	4	2025-06-28 02:50:52.783	2025-06-27 02:50:52.798779
635d8cdcffae21dc5906c2f55858c60d7e7848d91f41ee059eb64568d6e05db9	4	2025-06-28 03:39:13.011	2025-06-27 03:39:13.031494
607b3de2af9f3cbc7cb280f4da547793626dad1d2f8f498cf36eab62d2a36b5c	4	2025-06-28 03:42:00.105	2025-06-27 03:42:00.12518
0487a2141ad6aef8848c7b24db7ffbc2b17addd610ccaa983860adf2c84850e7	4	2025-06-28 03:58:30.718	2025-06-27 03:58:30.739007
fccdacaa5ddfb0b294fe6d321594039d9efa3020b24177777b44d3ad3542b906	4	2025-06-28 03:59:23.596	2025-06-27 03:59:23.615541
cbc78c66041b5ad64004d3fcea10ca1f10b76474afcd7180a1181a6075c34fc5	4	2025-06-28 04:05:40.212	2025-06-27 04:05:40.229153
57935a712259777f691003eb443d19857913c397c6258736c79eb66c96ea983f	4	2025-06-28 04:13:59.183	2025-06-27 04:13:59.199888
2f33fb3dbcffdef78a920a645772c9669619ad0bb91b7ccb693ede5100edd091	4	2025-06-28 17:31:26.833	2025-06-27 17:31:26.8538
8ca9a1ea522820426bec87d44370fc3abb36cf4219c486b24500326db74b82a5	4	2025-06-28 20:17:21.067	2025-06-27 20:17:21.080464
86f15223f75dd4d6452a0200d10d853401bf7a855024221363ca1733276ee741	4	2025-06-28 21:58:19.932	2025-06-27 21:58:19.955647
5afbea6aebc3b6621fbbb65d45aad32005c3742b6a51ca0873563bbbdfe9c29d	4	2025-06-28 23:07:06.072	2025-06-27 23:07:06.08761
7ffc2d1146366f245a5035ff40a17b75fb8c1d661e3089605c0fae77d038a3c8	4	2025-06-29 18:29:51.679	2025-06-28 18:29:51.694985
38f44429406c9522c7cfaa0f86fe5481d5bfb5818ea3c33b99f93385f65db744	4	2025-06-29 18:39:05.985	2025-06-28 18:39:06.00114
29af690bbf4bc11f4ff89777c02fda7694ed8cbd0acc1b32ec1f7f6190c252c3	4	2025-06-29 18:46:40.352	2025-06-28 18:46:40.367372
939c2ec5879cc3b185681affbc821b838d5281bbb908da7036e6244e489249f1	4	2025-06-29 18:47:21.042	2025-06-28 18:47:21.057888
0713dd20993f8236c527e11ef1e42f43d5752b6b2333b08fcbd756a8e80362d6	4	2025-06-29 18:52:15.379	2025-06-28 18:52:15.394022
9a7e2283d7baf7d8a252e9343d3d44f915baca74cebd659d7bbc9c49cffca526	4	2025-06-29 18:54:16.347	2025-06-28 18:54:16.361441
28dbdd6300b3a9affdf78550865c4bd310b6394951166a7bbb97b6e0123bbb16	4	2025-06-29 18:58:55.584	2025-06-28 18:58:55.602041
257e199095ca357056a65b16ae1fb49495feebe7b664a6c065d24b8e5134f7bc	4	2025-06-29 19:09:38.682	2025-06-28 19:09:38.697347
adcc0e566b87acab5825f74bbe2c769614e1768518b4d246f77d4c103b014717	4	2025-06-29 19:20:28.919	2025-06-28 19:20:28.935385
668728529e6b84703242693e06ad220e1cc4ccd95e7a294512b8e0b67f8dfefa	4	2025-06-29 20:31:17.762	2025-06-28 20:31:17.772773
36d6b7169605064a87ab3e81262b27846811ccc08484a923390a4f23aceabb79	4	2025-06-29 20:35:18.339	2025-06-28 20:35:18.349082
aa940ee30006c11d9823a389c6f574814d03e73ab44c48a7966ec2d66f0f793d	4	2025-06-29 21:22:04.884	2025-06-28 21:22:04.89766
c77a3e006ae1b55e550eaa00582f89be66d4ca6aebbe62ba30b05300f352e18a	4	2025-06-29 21:37:48.729	2025-06-28 21:37:48.743929
2b0128ada7fe63315fe536ce80ba4cbe7639befbee5aaa0c9167d6b0901b04b5	4	2025-06-29 21:42:38.157	2025-06-28 21:42:38.178009
455934384fe0360f907f58ed7d505a3070dccbca78d91897a208b23c13612450	4	2025-06-29 21:57:42.471	2025-06-28 21:57:42.486553
77c3df995ff1942fcdce7a8352d5c20630a9e905798474d8055608d136797b14	4	2025-06-29 21:58:09.861	2025-06-28 21:58:09.875866
ce9b03b01eac639ccde7592d28286b0586282c17f81f573363869abc0dab1a98	4	2025-06-29 22:01:20.534	2025-06-28 22:01:20.549319
f04837a9cb9c9398c11ca5cd3a616bc13b9a44f7708dbf8fd2481f50887ff473	4	2025-06-29 22:12:28.511	2025-06-28 22:12:28.527861
847cb1434488e566d638a34ddfc9638afcdb352815ff5abe8b776c0064aaa41d	4	2025-06-29 22:18:11.094	2025-06-28 22:18:11.108973
4c19cbdedbe1be555f0f6a00c57b44f1390e5439a731bb9dfa6a712560622c85	4	2025-06-29 22:21:12.425	2025-06-28 22:21:12.440678
5f0c87a4a5497380a81367337472141eef4ed0b2758d5eacda24d28b6a7ea8b3	4	2025-06-29 22:23:00.779	2025-06-28 22:23:00.794323
ed691291ede607d1ef08d26818304907992e1872ea08b702600c22cde3280e27	4	2025-06-29 22:29:34.375	2025-06-28 22:29:34.389614
ecba9ea1e80ede7ef3732f6b7e1e40772aba131f6204a81138e290350e1bcc0b	4	2025-06-29 22:35:37.56	2025-06-28 22:35:37.575176
eff322b1949d8161bf58d8727b762b75cd46772b13f273b306f6f80d3ce58115	4	2025-06-29 22:37:50.099	2025-06-28 22:37:50.113734
bceb6350272908631dfad297c75ad091b93306eecaa84504a5addc906a91c895	4	2025-06-29 22:46:45.617	2025-06-28 22:46:45.631509
ddb6a696dadcfc5c700c45a0cb9450c9b168a2c4d9cddd55c6ff7f5cc4cfc6c7	4	2025-06-29 23:05:22.092	2025-06-28 23:05:22.108066
1d00cabc7b063cd0956924e70d4b660f408570e38378913adc76a2e9dbcbe34d	4	2025-06-29 23:05:33.809	2025-06-28 23:05:33.823424
e911b5a50a9bedd22c47b680f5b8d4a586e76a586735bff7b661c9705d9e3d75	4	2025-06-30 01:30:16.877	2025-06-29 01:30:16.89328
708962c2f76a978ca3b8c700a921a4e0eca5e120d3ff9a9d1646041724efe93e	4	2025-06-30 01:35:34.293	2025-06-29 01:35:34.308224
7bfbda3aa2342226df5f2e8be08f805208cd8efd9556a3a1ee72fc2d0bf79043	4	2025-06-30 01:38:31.144	2025-06-29 01:38:31.15939
93355e6b7d091aa0946e231f32e3a58941901c8c8784dc9042cc2baa3f70fd40	4	2025-06-30 01:42:48.167	2025-06-29 01:42:48.183144
5b2f9d87387abd879f4b420760d45a805d4355b5ebd015b4df5d180a72053ae8	4	2025-06-30 02:10:18.257	2025-06-29 02:10:18.272231
8690b70b6dc457bdde3e5d40a9622ace9a52ff0fdf63e2a7ffa2bba042290c17	4	2025-06-30 02:21:21.635	2025-06-29 02:21:21.650697
8b2c99fb91ae408c5a0d02cfc5e2ce4986590a75704c0d5d7e488b13b5d103f9	4	2025-06-30 02:31:46.909	2025-06-29 02:31:46.924286
606a52c9adb4b7dd5023f9d289622ad2d119d54bef22f9837d42aa4ef97ad311	4	2025-06-30 02:43:27.274	2025-06-29 02:43:27.289731
d9febe5ede5045ce5086690e6895bd2a49594ddf14b5b070a3c44399a687340f	4	2025-06-30 02:45:44.207	2025-06-29 02:45:44.223051
5ff3a99c45fc5ad3f943fc3e96eb4c132fa40c2636b4250d358d9c12b594d27a	4	2025-06-30 02:55:13.483	2025-06-29 02:55:13.499247
aa578213f657d6f0f5baa6fbaa3ba1722694e794dcdc7abcb2c9654f8e32fe52	4	2025-06-30 03:02:44.688	2025-06-29 03:02:44.704602
3fc4d2c51fb7053d5bb1b4820ba542d8828f755d482959b0e5c8e648f3fa00eb	4	2025-06-30 03:10:53.922	2025-06-29 03:10:53.937548
697fd550cfbcc29a9c96d209c0369c9120bdc8cb9dcbba5b669cae26d7a960e0	4	2025-06-30 03:14:09.451	2025-06-29 03:14:09.470154
3df8ac30a45dd5e41bf78cf58340629284049bd1434c89a7bbf4faa5cd95e5b9	4	2025-06-30 03:16:25.64	2025-06-29 03:16:25.654502
289ade1a16745cd49af2c381549efbe4dd83b0add064d058d974a80e40e353e9	4	2025-06-30 03:18:55.074	2025-06-29 03:18:55.089751
251af8c96c4ae9015251bdd01ba83b0833b14ab0a5cfa441cff3344cf4b4c4b2	4	2025-06-30 03:22:58.178	2025-06-29 03:22:58.193255
794cae9b9afae32500c661df0e05ec61ce7c34c207765bf67e5fa0e0055f1d89	4	2025-06-30 03:32:04.653	2025-06-29 03:32:04.669036
d6785d38ec753f5baf6d438f1b2bdd913b52b573470962aa7a52bb64f6af4a6d	4	2025-06-30 03:38:33.435	2025-06-29 03:38:33.449619
26bf04d9397b39980d76a2a62f447eeffd1555babec9712ef6fa022f5e929f9e	4	2025-06-30 03:51:59.532	2025-06-29 03:51:59.547974
eaef1d91a532a648fb0d67ede56f784d6ad0929d56f958d35e8f9772c9952b3a	4	2025-06-30 03:54:19.567	2025-06-29 03:54:19.582629
91b28a38dd8ab2f11191dc4259246bbbbf9427787d9e5a42976c4cd39e45a1e8	4	2025-06-30 04:05:20.865	2025-06-29 04:05:20.881405
bd733aa814abd479d4c40077d757f013b8da25c1b87a2ed9de0aada29aa33807	4	2025-06-30 16:01:41.689	2025-06-29 16:01:41.709155
31d933962d5d28b7d7412139726844c0e03c0ded514b3a74ac8bbe1315caf434	4	2025-06-30 19:51:54.959	2025-06-29 19:51:54.97923
4ea161570532e8b3788493024033b482818059759840714fbb53c4d26b3f5599	4	2025-06-30 19:53:10.886	2025-06-29 19:53:10.905223
0db8dd85b97e343b35a8bd90a45a2504be2546597bee2d78109401b574868c9d	4	2025-06-30 20:03:55.339	2025-06-29 20:03:55.354685
2806e7ac79fe7cddc8d525074f41fe9f516a262cdfccb317cbdcb2eb3a03b676	4	2025-07-01 00:56:35.78	2025-06-30 00:56:35.795863
35a4fda23a4fa51812d1751a316e5daca872541a21a7dcab823a419d91bc5671	4	2025-07-01 01:15:00.522	2025-06-30 01:15:00.537384
67eb89be675b7bc2b7c6c9576c1e2b651356f9bae36d6144519ebd46aedc6803	4	2025-07-01 01:23:25.339	2025-06-30 01:23:25.354155
076ef13474f049d047562a346d90ddeb354497c567889a23878ae69e23910285	4	2025-07-01 01:58:13.297	2025-06-30 01:58:13.312765
d5c8c26b2d4a0a7af6ecdbd9e21bf453b52f01581351b82ba47ef74fb6bd097b	4	2025-07-01 02:03:39.558	2025-06-30 02:03:39.572134
8f71d2b0af74fdbfdb6d55deb5ef1a97a85e9fe0ad3450b418634ac37b7ce1b2	4	2025-07-01 02:10:13.953	2025-06-30 02:10:13.968159
c55e1822e61eca93d197da3f63fda203d1a560d87f7d17c75a9f00148d11b2c6	4	2025-07-01 02:16:23.182	2025-06-30 02:16:23.197362
89192f1df16602d0301fabaf41165233ff0bdb580238f932221ef7ecb5b42bb5	4	2025-07-01 02:33:26.086	2025-06-30 02:33:26.10142
97c227af218f969fb47375d9b991aeb0f0fc33145804ee65f6ccbf66024d7079	4	2025-07-01 02:34:38.71	2025-06-30 02:34:38.727402
a2c988498007a1b9808a131da14d7a3e19cb30a646aeb11bcdedafc0dc344950	4	2025-07-01 02:39:12.174	2025-06-30 02:39:12.190751
4e43f78c8c9ef4858804a445d13f02a9863a51c37f82b410daa01215fc566e3a	4	2025-07-01 03:04:05.372	2025-06-30 03:04:05.387405
c938898c36f11519a981e5d699cda55c08e79c5f1d51059d352b6c0c8fc5c963	4	2025-07-01 03:07:02.876	2025-06-30 03:07:02.891074
29501b8c20143f4d7137dd12309183790ba8d45351f9551752f33695f71bd966	4	2025-07-01 03:10:08.652	2025-06-30 03:10:08.667071
0e4b8e2d551dd1b03ab5ec58272ff217ef37e3d93874f78c5e359813fee15699	4	2025-07-01 03:12:15.77	2025-06-30 03:12:15.785496
12a5bed6c7197034aa40805136b9ed57a5d37d4768a82979ef8c8e67e8995f81	4	2025-07-01 03:16:34.996	2025-06-30 03:16:35.011253
51d8b2d1efd4f276f417effc3b73683a275053b3772ec9cc8e2cb223045e453b	4	2025-07-01 03:27:20.504	2025-06-30 03:27:20.524637
d8dfd7299f3f219ea749978a8636e1da7c2ef0c3321d55e384ba91e4a10075f4	4	2025-07-01 04:49:56.496	2025-06-30 04:49:56.514192
cd2f47fb9d0bc2070382c88dac3e9fc224328b00222d1deaa0a4a2c612cddaf7	4	2025-07-01 04:51:59.859	2025-06-30 04:51:59.878344
0f04ab62ec1ba70db5770d6b2444d5ff27828a4dcb326c4286f243112f96a7e2	4	2025-07-01 04:56:46.033	2025-06-30 04:56:46.0483
67c7dbe00ce4079d7bf9f25301d85c824578cee2d1fec3be7d9bb26c68a4e4b1	4	2025-07-01 04:59:57.773	2025-06-30 04:59:57.789002
af8b7ed4ae6b5ad8c5ee064ea19a279d9b04dc41bdd53c308b238e339e747806	4	2025-07-01 05:01:29.925	2025-06-30 05:01:29.943232
c582385c6190ef7ef2e17e5b9611ff2e1fec6b0aeab959ea3fee6144606ce281	4	2025-07-01 19:06:38.723	2025-06-30 19:06:38.743846
445419ccfa4a8dc241e359f1be4885920fd96a03793b5b645865d5a26a69c087	4	2025-07-01 19:23:08.998	2025-06-30 19:23:09.016884
18327229ccf1ab1ca03807b2dc8c6e05b019ade037244430f69c9036da2ebf01	4	2025-07-01 19:40:32.106	2025-06-30 19:40:32.125537
63db3b2fbbc59cef458ea7df7b1cb5dcc3dd651f3ffbc93ae43e17cbc7cf10c2	4	2025-07-01 19:47:08.051	2025-06-30 19:47:08.065867
a8c11c56f8c4a4792679c35d5724221661a95f06af0c86234653793b7841d2b2	4	2025-07-01 20:24:44.225	2025-06-30 20:24:44.245128
97013e3e0cd6d29002e392ff6cdd31f2d740f847458e88d5043fb20570b4e224	4	2025-07-01 20:49:04.405	2025-06-30 20:49:04.423141
a6772d876803e59d263e70e2c0cee721bb4d49b937b5284c296f4070f0241a8f	4	2025-07-01 20:55:36.706	2025-06-30 20:55:36.726939
c644bcdab81f134cf697e0633cedfd6e6e65c81e5d6eaf3b6c6a4d759599594b	4	2025-07-01 21:00:34.841	2025-06-30 21:00:34.85583
d0c5f274731df1ba6e8832f95223994f66f3ad80ac4ca133d4aa7b922b4ffe3b	4	2025-07-01 21:01:56.158	2025-06-30 21:01:56.172244
c128806c4d0a678d58cbf729569f39c3d06486bd5d0c28db0de1d2c2d1130832	4	2025-07-03 17:32:47.266	2025-07-02 17:32:47.287118
528fa7ccaf8086b4779f7e420e4197d24a5ddeef66778ad4b76d44eb87188731	4	2025-07-03 17:43:49.409	2025-07-02 17:43:49.424221
5dda8738efc7eb0d638c0f41f0a3b6ad8867d49ff317a9d780e7dc2122d74334	4	2025-07-05 01:52:36.901	2025-07-04 01:52:36.921217
b01a4947d91d901d56ccc8f4d620168d84b74ec495da8cf6007f4b8889378bf4	4	2025-07-05 02:27:25.417	2025-07-04 02:27:25.437555
cacf4ff39becf4ebbc2bf58cfafb39e02733a2442baf5e712a7bf5baad087ed2	4	2025-07-05 02:34:28.115	2025-07-04 02:34:28.1376
6e68e4ece1a738b5eb08391f6c1f4731850efdcea7fa8a6ce678e3823896e3ab	4	2025-07-05 15:41:47.136	2025-07-04 15:41:47.15196
d9bb71f0e2f30db268a01e98d7b9f5882372b8be42bbb4be74e90f4eaa02c32b	4	2025-07-05 15:45:52.77	2025-07-04 15:45:52.785467
06cd029a77856170af45b73b7385cb8755d3ee3209c7e0b80c851dfae2286f27	4	2025-07-05 15:54:12.134	2025-07-04 15:54:12.149834
a036fc1d610b8ce8f566717eaa736fe4325038c6d381c9c8a8104dca91cb32a9	4	2025-07-05 16:01:01.788	2025-07-04 16:01:01.80302
d3edbba11c51efc490325c3e1c85f6d08a1a2867bd50ba90f35fbecd5298c3ed	4	2025-07-07 01:37:37.039	2025-07-06 01:37:37.059721
e19538687852d5cd29493b6fc60e377273c5cd7e762487c4f8d84a0e40dc0913	4	2025-07-07 01:56:09.73	2025-07-06 01:56:09.746421
497a830e59188466a10410cc671312e3bd7e053d6a316360ac2b11fdc7b7cc89	4	2025-07-08 14:47:42.496	2025-07-07 14:47:42.516613
755ef921dde2207014aef028aa1aeee859b040380e6ca56079b4709f5cbe9319	4	2025-07-14 03:01:31.054	2025-07-13 03:01:31.075517
bc9a2a0f9da54972eaa624134f29daeec75e08e79e8ce7f3f4340733da13901b	4	2025-07-19 16:18:34.78	2025-07-18 16:18:34.800553
afebeec6ea38034d015b4b396a5fb56a9ff0adac2471465379aa5c13d55da1b8	4	2025-07-21 04:25:53.597	2025-07-20 04:25:53.616096
2b5eebacd478799306acb5cbf7a80445c204d00519e77c26db5b3f3794bcfc7c	4	2025-07-21 04:43:05.815	2025-07-20 04:43:05.834225
8aba2b80341b8f3c130a0ead8dd8cb83588f9a4311cd3178c96f9c30d77d5e8a	4	2025-07-21 04:52:33.232	2025-07-20 04:52:33.251594
0f7c472b1439338f8207a917abc6f0d58dc3a97865ffb7da9690a24788b5a692	4	2025-07-22 01:09:25.462	2025-07-21 01:09:25.482798
9fe77d66873d9333ff6a10892aceeaa5fc0f7ad74d0e6eb65e760d45137853df	4	2025-07-23 04:31:10.25	2025-07-22 04:31:10.270524
eb9e9af104c7de3506bace50ccbfe21686838f3b2d22b945cb8a6a3c9236f908	4	2025-07-23 05:13:42.547	2025-07-22 05:13:42.562248
72265f0c4ca792261ec47ae8221bb67bb957724b702d6b106dcc27fc7d9f1c6a	4	2025-07-23 05:23:04.695	2025-07-22 05:23:04.710618
71a4e72e8ab6685dae4f24581ffd663fe598fab3a4381cca11f001c9582f7af8	4	2025-07-23 05:26:21.825	2025-07-22 05:26:21.840905
380806d4d6947d5005793a546dc7f93ede1e24b51f730708b6b8655f74a9ac1a	4	2025-07-23 05:44:33.343	2025-07-22 05:44:33.358014
a1e99522d57c72335b48f8b002c6fbfd3b37c10297066fc937307339e1426d1a	4	2025-07-23 05:47:21.377	2025-07-22 05:47:21.392364
1409c05167c821e27f6cbeb6a4dd4b840b1d2d2aef28d9ec5a70ed0df8f1dbf8	4	2025-07-23 05:57:52.798	2025-07-22 05:57:52.813595
4a58bd8d141014326ccff7651c81116d64f89886a867f34807a04f3755399f27	4	2025-07-23 06:01:12.518	2025-07-22 06:01:12.532336
76429072ec385ca856c9e1cef92241f39fbd75b3173403de7441f4faef120c89	4	2025-07-23 06:06:49.982	2025-07-22 06:06:49.997407
033793df6a660d21a88154b7382bfe6172e01c4a2a397bd8b5c3bb8a3806e589	4	2025-07-23 06:13:24.506	2025-07-22 06:13:24.521987
bba8b8fe9c71d9bdb13ee376518b52fc6a5eebaa5a8936fb0d3d51711eb2d68d	4	2025-07-23 06:15:39.459	2025-07-22 06:15:39.4748
75b0fa2195a933488fab8de4e6cb90790d454a8170dbec52f8ebf895f37dbfc6	4	2025-07-23 06:19:28.71	2025-07-22 06:19:28.725395
4a38dc80c4295050e2c48f6a1e08f17cc057213bbe8c5e4fa4409974909dba7a	4	2025-07-23 06:33:08.513	2025-07-22 06:33:08.532132
117ed85ef8b120d6d25c2c842587540af82761cd564b8b0cf9027cb1addd63d8	4	2025-07-23 06:35:08.781	2025-07-22 06:35:08.796354
7674470ceec3e08d5138690e247a0afb47f0f209e3e51c39fb1167617539c669	4	2025-07-23 06:36:09.957	2025-07-22 06:36:09.973254
2cf0424d2714a501593ef2398213a719fdeb5bd8244e9ebcfc8d0b9eb3ac6479	4	2025-07-23 06:38:33.301	2025-07-22 06:38:33.316931
1f465cb4f670e421234ba8c2059044fac931d095933ad485e4df3eaf0e005810	4	2025-07-23 06:46:58.152	2025-07-22 06:46:58.167581
e6fffc38d970447040aa7dcfe5482f8db907c734dac7904fa2614c8d58bed9b2	4	2025-07-23 17:12:24.736	2025-07-22 17:12:24.750737
39f9e87140fc973daabc1aa4fb35b4482540d192560af38fffa17c030d60af54	4	2025-07-23 17:13:21.555	2025-07-22 17:13:21.574641
a56f426686a878a7833f7251073ab3f0adbb5c099620ef8efb29b63935566a83	4	2025-07-23 17:47:16.749	2025-07-22 17:47:16.765881
7edbcf3a572cef3f0fd4c851925d1c27709c2f6ebf939bd1ba982fa40f608c7e	4	2025-07-23 18:35:41.056	2025-07-22 18:35:41.071925
f0bdbf4fbed0fbbee38d44a6de26d918234da2bf026c0fb100bbb65bc9563419	4	2025-07-24 00:39:39.223	2025-07-23 00:39:39.238187
40d1ff8f59a39219e320a53169b5f738a568a34b1fa3765c479e0ecbf8e642fc	4	2025-07-24 01:00:03.15	2025-07-23 01:00:03.172079
8e017a35de174164925b37be95e5590c2cbe5be77961aeed77b7a612188a8ad9	4	2025-07-24 14:14:33.316	2025-07-23 14:14:33.338052
8e2a34cff3e39d74deccafc45fd153380d8d36df92b40e090111d4a9f7fbef43	4	2025-07-24 14:17:15.898	2025-07-23 14:17:15.918345
bee22130803e12d506c594a99dfd6d90a6b02cc3ee17805bf28bbd6245bf3f86	4	2025-07-24 14:35:53.983	2025-07-23 14:35:54.002805
166dabf7c5431ee4ec0aabbbe5c18bbb8f609e0696a4ba924799898405dcc5d6	11	2025-07-24 14:43:29.172	2025-07-23 14:43:29.187354
ca4763caefab43a1ec1978a68dab6befc97f60cb92b7e84ff6af1906edcbd9e1	4	2025-07-24 14:55:59.012	2025-07-23 14:55:59.027678
\.


--
-- Data for Name: ai_consultations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_consultations (id, first_name, last_name, email, phone, company, industry, business_size, current_ai_usage, ai_interests, project_timeline, budget, project_description, preferred_contact_time, created_at) FROM stdin;
\.


--
-- Data for Name: blocked_countries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blocked_countries (id, country_code, country_name, created_at) FROM stdin;
1	CN	China	2025-06-30 21:17:17.06201
2	RU	Russia	2025-06-30 21:17:21.257671
3	IR	Iran	2025-06-30 21:17:23.747055
4	KP	North Korea	2025-06-30 21:17:26.667383
5	PK	Pakistan	2025-06-30 21:17:29.224014
6	AF	Afghanistan	2025-06-30 21:17:31.422867
7	IQ	Iraq	2025-06-30 21:17:34.008943
8	SY	Syria	2025-06-30 21:17:37.250808
9	LY	Libya	2025-06-30 21:17:40.405808
10	SO	Somalia	2025-06-30 21:17:43.627457
11	SD	Sudan	2025-06-30 21:17:46.485294
12	YE	Yemen	2025-06-30 21:17:49.452226
13	MM	Myanmar	2025-06-30 21:17:51.736271
14	VE	Venezuela	2025-06-30 21:17:55.409151
15	IN	India	2025-06-30 21:18:05.656989
16	BD	Bangladesh	2025-06-30 21:18:09.173559
17	NG	Nigeria	2025-06-30 21:18:11.907006
18	GH	Ghana	2025-06-30 21:18:14.950709
19	KE	Kenya	2025-06-30 21:18:17.562962
20	ZA	South Africa	2025-06-30 21:18:20.560524
21	EG	Egypt	2025-06-30 21:18:23.395046
22	TH	Thailand	2025-06-30 21:18:26.634397
23	VN	Vietnam	2025-06-30 21:18:28.869173
24	ID	Indonesia	2025-06-30 21:18:31.496742
25	PH	Philippines	2025-06-30 21:18:35.866972
26	MY	Malaysia	2025-06-30 21:18:38.52981
27	AR	Argentina	2025-06-30 21:32:41.598478
28	AT	Austria	2025-06-30 21:32:48.784524
29	BY	Belarus	2025-06-30 21:32:52.216805
30	BE	Belgium	2025-06-30 21:32:54.73112
31	BO	Bolivia	2025-06-30 21:32:57.050713
32	CL	Chile	2025-06-30 21:33:01.305527
33	CO	Colombia	2025-06-30 21:33:24.673775
34	CZ	Czech Republic	2025-06-30 21:33:27.841294
35	DK	Denmark	2025-06-30 21:33:30.711229
36	EC	Ecuador	2025-06-30 21:33:32.872546
37	FI	Finland	2025-06-30 21:33:35.792137
38	FR	France	2025-06-30 21:33:38.21475
39	DE	Germany	2025-06-30 21:33:40.529092
40	GR	Greece	2025-06-30 21:33:43.100275
41	HK	Hong Kong	2025-06-30 21:33:45.556428
42	HU	Hungary	2025-06-30 21:33:47.885509
43	IE	Ireland	2025-06-30 21:33:50.99776
44	IL	Israel	2025-06-30 21:33:53.591075
45	IT	Italy	2025-06-30 21:33:56.228274
46	JP	Japan	2025-06-30 21:33:59.401272
47	JO	Jordan	2025-06-30 21:34:01.892399
48	LB	Lebanon	2025-06-30 21:34:04.604146
49	MX	Mexico	2025-06-30 21:34:07.809949
50	MA	Morocco	2025-06-30 21:34:10.388223
51	NL	Netherlands	2025-06-30 21:34:12.792228
52	NZ	New Zealand	2025-06-30 21:34:15.227557
53	NO	Norway	2025-06-30 21:34:17.548788
54	PE	Peru	2025-06-30 21:34:20.128851
55	PL	Poland	2025-06-30 21:34:22.876358
56	PT	Portugal	2025-06-30 21:34:26.415935
57	SA	Saudi Arabia	2025-06-30 21:34:29.583886
58	SG	Singapore	2025-06-30 21:34:32.254024
59	KR	South Korea	2025-06-30 21:34:34.494402
60	ES	Spain	2025-06-30 21:34:37.777868
61	LK	Sri Lanka	2025-06-30 21:34:40.080439
62	SE	Sweden	2025-06-30 21:34:42.928117
63	CH	Switzerland	2025-06-30 21:34:45.464591
64	TW	Taiwan	2025-06-30 21:34:48.239716
65	TN	Tunisia	2025-06-30 21:34:51.034812
66	AE	UAE	2025-06-30 21:34:53.99623
67	TR	Turkey	2025-06-30 21:34:56.366077
68	UA	Ukraine	2025-06-30 21:34:58.660759
69	GB	United Kingdom	2025-06-30 21:35:01.175687
70	UY	Uruguay	2025-06-30 21:35:04.360821
71	AU	Australia	2025-06-30 21:35:14.44601
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_messages (id, session_id, sender, sender_name, message, message_type, metadata, is_read, created_at) FROM stdin;
1	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:39:35.602457
2	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:39:36.507168
3	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:39:59.291392
4	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:39:59.471263
5	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:39:59.770141
6	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:40:05.411042
7	4	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:40:06.254278
8	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:23.722677
9	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:24.67796
10	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:26.001276
11	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:32.557372
12	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:33.235256
13	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:33.608025
14	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:33.945796
15	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:34.261841
16	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:34.559754
17	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:34.883535
18	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:35.161884
19	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:36.367866
20	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:37.042642
21	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:39.12239
22	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:39.565005
23	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:39.85583
24	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:40.050137
25	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:40.26792
26	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:40.46157
27	5	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:47:59.581448
28	6	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:49:24.681576
29	7	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 03:59:43.02832
30	8	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 17:32:28.950404
31	9	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 20:15:56.388287
32	10	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 20:17:49.919901
33	11	system	System	This conversation has been transferred to a human agent. Please wait while we connect you.	system	\N	f	2025-06-27 20:29:23.14703
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_sessions (id, session_id, customer_name, customer_email, customer_phone, status, is_human_transfer, transferred_at, closed_at, admin_user_id, last_message_at, created_at, updated_at) FROM stdin;
1	chat_1750994883701_dlvq2ae95	\N	\N	\N	active	f	\N	\N	\N	2025-06-27 03:28:04.081605	2025-06-27 03:28:04.081605	2025-06-27 03:28:04.081605
2	chat_1750995009966_y1voxj4ty	\N	\N	\N	active	f	\N	\N	\N	2025-06-27 03:30:10.05741	2025-06-27 03:30:10.05741	2025-06-27 03:30:10.05741
3	chat_1750995108953_4mesu11hl	\N	\N	\N	active	f	\N	\N	\N	2025-06-27 03:31:49.040205	2025-06-27 03:31:49.040205	2025-06-27 03:31:49.040205
6	chat_1750996159505_yimqje87z	\N	\N	\N	transferred	t	2025-06-27 03:49:24.644	\N	\N	2025-06-27 03:49:24.693	2025-06-27 03:49:19.604138	2025-06-27 03:49:24.644
7	chat_1750996746752_ykgo9cu92	\N	\N	\N	transferred	t	2025-06-27 03:59:42.972	\N	\N	2025-06-27 03:59:43.048	2025-06-27 03:59:06.77267	2025-06-27 03:59:42.973
8	chat_1751045509063_2v6mbtny7	\N	\N	\N	transferred	t	2025-06-27 17:32:28.897	\N	\N	2025-06-27 17:32:28.967	2025-06-27 17:31:49.083799	2025-06-27 17:32:28.897
9	chat_1751055336025_sm3g0ue76	\N	\N	\N	transferred	t	2025-06-27 20:15:56.342	\N	\N	2025-06-27 20:15:56.399	2025-06-27 20:15:36.114002	2025-06-27 20:15:56.342
4	chat_1750995216855_a3y2lqqe3	\N	\N	\N	transferred	t	2025-06-27 03:40:06.217	\N	\N	2025-06-27 03:40:06.262	2025-06-27 03:33:36.960901	2025-06-27 03:40:06.217
10	chat_1751055468271_nneqxw6md	\N	\N	\N	transferred	t	2025-06-27 20:17:49.883	\N	\N	2025-06-27 20:17:49.929	2025-06-27 20:17:48.285679	2025-06-27 20:17:49.883
11	chat_1751056161845_flolu7vd2	\N	\N	\N	transferred	t	2025-06-27 20:29:23.108	\N	\N	2025-06-27 20:29:23.159	2025-06-27 20:29:21.859398	2025-06-27 20:29:23.108
5	chat_1750995964487_mmnk63jn7	\N	\N	\N	transferred	t	2025-06-27 03:47:59.53	\N	\N	2025-06-27 03:47:59.593	2025-06-27 03:46:04.50788	2025-06-27 03:47:59.53
\.


--
-- Data for Name: color_palette; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.color_palette (id, name, hex_value, description, category, order_index, is_active, created_at, updated_at) FROM stdin;
1	APurple	#5f30e3		general	0	t	2025-06-28 19:10:32.417723	2025-06-28 19:10:32.417723
2	AOrange	#f27121		general	0	t	2025-06-28 19:11:16.952855	2025-06-28 19:11:16.952855
3	ABlue	#0c5ca2		general	0	t	2025-06-28 19:11:35.271174	2025-06-28 19:11:35.271174
4	ANavyBlue	#2b3691		general	0	t	2025-06-28 19:12:01.600207	2025-06-28 19:12:01.600207
5	AGray	#e0e0e0		general	0	t	2025-06-28 19:12:50.32588	2025-06-28 19:12:50.32588
6	ALighterPurple	#5962ef		general	0	t	2025-06-28 19:13:13.8103	2025-06-28 19:13:13.8103
7	AYellow	#f6e234		general	0	t	2025-06-28 19:13:28.803142	2025-06-28 19:13:28.803142
8	ALightBlue	#7e93e6		general	0	t	2025-06-28 19:14:07.463581	2025-06-28 19:14:07.463581
9	AGrape	#691a74		general	0	t	2025-06-28 19:15:12.290763	2025-06-28 19:15:12.290763
10	APlum	#9a3fa3		general	0	t	2025-06-28 19:15:53.466056	2025-06-28 19:15:53.466056
11	AHotRed	#ff2500		general	0	t	2025-06-28 19:16:07.278035	2025-06-28 19:16:07.278035
12	Basic Service Blue	#2563eb	Standard blue for basic service tiers	button	1	t	2025-06-30 02:12:26.748983	2025-06-30 02:12:26.748983
13	Professional Green	#059669	Professional tier service color	button	2	t	2025-06-30 02:12:26.748983	2025-06-30 02:12:26.748983
14	Enterprise Purple	#7c3aed	Premium enterprise service color	button	3	t	2025-06-30 02:12:26.748983	2025-06-30 02:12:26.748983
15	AramisTech Orange	#f97316	Brand orange for call-to-action buttons	button	4	t	2025-06-30 02:12:26.748983	2025-06-30 02:12:26.748983
16	Success Green	#16a34a	Success and completion actions	button	5	t	2025-06-30 02:12:26.748983	2025-06-30 02:12:26.748983
17	Alert Red	#dc2626	Urgent or important actions	button	6	t	2025-06-30 02:12:26.748983	2025-06-30 02:12:26.748983
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contacts (id, first_name, last_name, email, phone, company, service, employees, challenges, contact_time, created_at) FROM stdin;
1	Contact	Test	contact@example.com	(561) 419-7800	Test Company	IT Support	10-25	Need reliable IT support	Business Hours	2025-06-27 17:20:01.19647
3	Kathy	Ferreira	kdf040591@gmail.com	+15733010800	None	Windows 10 Upgrade	\N		\N	2025-07-11 13:23:05.532136
4						Windows 10 Upgrade	\N		\N	2025-07-11 21:08:39.081683
\.


--
-- Data for Name: country_blocking; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.country_blocking (id, is_enabled, block_message, message_title, font_size, font_color, background_color, border_color, show_contact_info, contact_message, created_at, updated_at) FROM stdin;
1	t	This service is not available in your region.	Our Website is only available in North America	text-xl	#2563eb	#f9fafb	#f27121	t	If you believe this is an error, please contact us at sales@aramistech.com	2025-06-30 21:17:11.448021	2025-06-30 21:25:03.876
\.


--
-- Data for Name: exit_intent_popup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.exit_intent_popup (id, title, message, button_text, button_url, image_url, is_active, background_color, text_color, updated_at, button_color) FROM stdin;
1	Wait! Don't Leave Yet	Get a free IT consultation before you go! Our experts are standing by to help with your technology needs.	Get Free Consultation	/contact	\N	t	#ffffff	#000000	2025-06-26 12:36:28.688781	#2563eb
\.


--
-- Data for Name: footer_links; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.footer_links (id, section, label, url, is_active, order_index, target, created_at, updated_at) FROM stdin;
1	Services	IT Support & Maintenance	/services	t	1	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
2	Services	AI Development	/ai-development	t	2	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
4	Services	Service Calculator	/service-calculator	t	4	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
5	Support	Customer Portal	/customer-portal	t	1	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
6	Support	Knowledge Base	/knowledge-base	t	2	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
7	Support	IP Lookup Tool	/ip-lookup	t	3	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
8	Company	About Us	/#about	t	1	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
9	Company	Our Team	/#team	t	2	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
10	Company	Contact	/#contact	t	3	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
11	Resources	Free Consultation	/#contact	t	1	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
12	Resources	Quick Quote	/#hero	t	2	_self	2025-06-30 02:59:50.498295	2025-06-30 02:59:50.498295
3	Services	Windows 10 Upgrade	/windows10-upgrade	t	4	_self	2025-06-30 02:59:50.498295	2025-06-30 03:12:39.608
\.


--
-- Data for Name: it_consultations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.it_consultations (id, first_name, last_name, email, phone, company, employees, services, urgency, budget, challenges, preferred_contact_time, created_at) FROM stdin;
1	Jose	Does	jd@aol.com	3052212288	my test	\N	{"Network Setup","IT Support"}	soon	\N	we need support	\N	2025-06-27 19:55:10.228043
2	Barbie	Figueroa	barbief@pbfpmarketing.biz	3059033422	PBFP Marketing & Design, Inc.	\N	{"IT Support","Remote Work Setup"}	soon	\N	I'm inquiring about setting up remote services so I can work from anywhere in the world 	\N	2025-06-29 14:54:15.238023
\.


--
-- Data for Name: knowledge_base_articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.knowledge_base_articles (id, title, slug, content, excerpt, category_id, tags, is_published, view_count, order_index, meta_title, meta_description, created_at, updated_at) FROM stdin;
1	How to Fix a Slow Computer	fix-slow-computer	Is your computer running slower than usual? Here are the most common causes and solutions:\n\n1. Too many startup programs\n- Press Ctrl+Shift+Esc to open Task Manager\n- Click the Startup tab\n- Disable unnecessary programs\n\n2. Not enough storage space\n- Free up at least 15% of your hard drive space\n- Use Disk Cleanup tool\n- Uninstall unused programs\n\n3. Outdated software\n- Keep Windows updated\n- Update your drivers\n- Run antivirus scans\n\n4. Too many browser tabs\n- Close unused tabs\n- Clear browser cache\n- Disable unnecessary extensions\n\nIf these steps don't help, contact AramisTech at (305) 814-4461 for professional diagnosis.	Learn how to diagnose and fix common causes of slow computer performance with these simple troubleshooting steps.	1	{performance,"slow computer",troubleshooting,maintenance}	t	0	1	How to Fix a Slow Computer - AramisTech IT Support	Step-by-step guide to diagnose and fix slow computer performance issues. Professional IT support available in South Florida.	2025-06-27 02:40:29.14796	2025-06-27 02:40:29.14796
2	Protecting Your Business from Ransomware	ransomware-protection	Ransomware attacks can devastate businesses. Here's how to protect yourself:\n\n**Prevention Strategies:**\n\n1. Regular Backups\n- Backup data daily to multiple locations\n- Test backup restoration regularly\n- Keep backups disconnected from network\n\n2. Employee Training\n- Don't click suspicious links\n- Verify email senders before opening attachments\n- Report phishing attempts immediately\n\n3. Software Updates\n- Install security patches promptly\n- Use reputable antivirus software\n- Enable automatic updates when possible\n\n4. Network Security\n- Use strong passwords and 2FA\n- Limit user permissions\n- Monitor network activity\n\n**If You're Attacked:**\n- Disconnect infected systems immediately\n- Don't pay the ransom\n- Contact law enforcement\n- Call AramisTech at (305) 814-4461 for emergency response\n\nWe provide 24/7 cybersecurity monitoring and response for South Florida businesses.	Essential guide to protecting your business from ransomware attacks and what to do if you become a victim.	2	{ransomware,cybersecurity,"business protection",backup}	t	0	1	Ransomware Protection for Businesses - AramisTech Cybersecurity	Complete guide to protecting your business from ransomware attacks. 24/7 cybersecurity support in Miami and Broward County.	2025-06-27 02:40:29.14796	2025-06-27 02:40:29.14796
5	Data Backup Best Practices for Small Business	data-backup-best-practices	Protecting your business data is critical. Here's a comprehensive backup strategy:\n\n**The 3-2-1 Backup Rule:**\n- 3 copies of important data\n- 2 different storage types (local and cloud)  \n- 1 offsite backup location\n\n**Backup Solutions for Business:**\n\n1. **Cloud Backup Services:**\n   - Microsoft OneDrive for Business\n   - Google Workspace\n   - Dropbox Business\n   - Automatic syncing and version history\n\n2. **Local Backup Options:**\n   - External hard drives\n   - Network Attached Storage (NAS)\n   - Tape backup systems for large data\n\n3. **Automated Backup Tools:**\n   - Windows Backup and Restore\n   - Time Machine (Mac)\n   - Third-party solutions like Acronis\n\n**What to Backup:**\n- Financial records and accounting data\n- Customer information and databases\n- Email archives\n- Business documents and contracts\n- Operating system and application settings\n\n**Backup Schedule Recommendations:**\n- Critical data: Daily automated backups\n- Important files: Weekly backups\n- Full system image: Monthly backups\n- Test restore process: Quarterly\n\n**Security Considerations:**\n- Encrypt all backup data\n- Use strong passwords for backup accounts\n- Limit access to backup systems\n- Regular security audits\n\n**Disaster Recovery Planning:**\n- Document your backup procedures\n- Train staff on restore processes\n- Test recovery regularly\n- Have emergency contact information ready\n\nAramisTech provides comprehensive backup solutions and disaster recovery planning for South Florida businesses. Protect your data with professional backup services - call (305) 814-4461.	Essential data backup strategies and best practices to protect your business from data loss and ensure business continuity.	2	{backup,"data protection","disaster recovery","business continuity","cloud storage"}	t	0	2	Data Backup Best Practices for Small Business | AramisTech	Comprehensive data backup guide for small businesses. Learn the 3-2-1 rule and professional backup strategies from AramisTech IT experts.	2025-06-27 02:46:24.240966	2025-06-27 02:46:24.240966
4	Email Setup Guide for Outlook and Gmail	email-setup-guide	Setting up email on your devices is essential for business productivity. Here's how to configure popular email clients:\n\n**Microsoft Outlook Setup:**\n\n1. Open Outlook and click File > Add Account\n2. Enter your email address and click Connect\n3. Enter your password when prompted\n4. Outlook will automatically configure most settings\n5. For manual setup, use these common settings:\n   - IMAP Server: imap.gmail.com (Gmail) or outlook.office365.com (Office 365)\n   - SMTP Server: smtp.gmail.com (Gmail) or smtp.office365.com (Office 365)\n   - Port 993 for IMAP, Port 587 for SMTP\n   - Use SSL/TLS encryption\n\n**Gmail on Mobile Devices:**\n\n1. Open Settings > Mail > Accounts\n2. Tap "Add Account" and select Gmail\n3. Enter your Gmail address and password\n4. Allow access to contacts and calendar if needed\n\n**Troubleshooting Common Issues:**\n\n- Authentication errors: Enable 2-factor authentication and use app passwords\n- Sync problems: Check internet connection and account settings\n- Missing emails: Check spam folder and storage limits\n\n**Business Email Security:**\n- Always use strong passwords\n- Enable two-factor authentication\n- Be cautious with email attachments\n- Verify sender identity before clicking links\n\nNeed help with business email setup? AramisTech provides professional email configuration and security services. Call (305) 814-4461 for expert assistance.	Complete guide to setting up email on Outlook, Gmail, and mobile devices with troubleshooting tips and security best practices.	1	{email,outlook,gmail,setup,configuration,mobile}	t	2	2	Email Setup Guide - Outlook & Gmail Configuration | AramisTech	Professional email setup guide for Outlook and Gmail. Includes mobile configuration and troubleshooting tips from AramisTech IT experts.	2025-06-27 02:46:24.240966	2025-06-27 02:46:24.240966
8	Password Security and Management Guide	password-security-management	Strong password practices are your first line of defense against cyber attacks:\n\n**Creating Strong Passwords:**\n\n1. **Password Requirements:**\n   - Minimum 12 characters (16+ recommended)\n   - Mix of uppercase, lowercase, numbers, symbols\n   - Avoid personal information (names, birthdays)\n   - Don't use dictionary words or common phrases\n\n2. **Password Creation Methods:**\n   - Use passphrases: "Coffee$Morning#Routine2024"\n   - Random password generators\n   - Substitute characters: @ for a, 3 for e\n   - Combine unrelated words with symbols\n\n**Password Management Best Practices:**\n\n3. **Never Reuse Passwords:**\n   - Unique password for every account\n   - Especially important for financial/business accounts\n   - Change passwords if service is breached\n\n4. **Password Manager Solutions:**\n   - LastPass, 1Password, Bitwarden\n   - Generate and store complex passwords\n   - Auto-fill credentials securely\n   - Sync across all devices\n\n5. **Two-Factor Authentication (2FA):**\n   - Enable on all important accounts\n   - Use authenticator apps (Google, Microsoft)\n   - SMS backup when app unavailable\n   - Hardware keys for highest security\n\n**Business Password Policies:**\n\n6. **Employee Training:**\n   - Regular password security education\n   - Phishing awareness training\n   - Incident reporting procedures\n   - Password sharing prohibition\n\n7. **IT Administrative Controls:**\n   - Enforce minimum password complexity\n   - Require regular password changes\n   - Monitor for breached credentials\n   - Implement account lockout policies\n\n**Signs Your Password May Be Compromised:**\n- Unexpected login notifications\n- Account activity you didn't perform\n- Password reset emails you didn't request\n- Suspicious account changes\n\n**What to Do If Compromised:**\n1. Change password immediately\n2. Check all linked accounts\n3. Review recent account activity\n4. Enable 2FA if not already active\n5. Scan devices for malware\n\n**Enterprise Solutions:**\n- Single Sign-On (SSO) implementation\n- Active Directory password policies\n- Privileged access management\n- Security awareness training programs\n\nAramisTech provides comprehensive cybersecurity services including password policy implementation and security training. Protect your business with professional security services - call (305) 814-4461.	Complete guide to password security and management including creation tips, manager tools, and business security policies.	2	{"password security","two-factor authentication","password manager",cybersecurity,"business security"}	t	0	3	Password Security and Management Guide | AramisTech Cybersecurity	Professional password security guide covering creation, management, and business policies. Cybersecurity expertise from AramisTech.	2025-06-27 02:46:24.240966	2025-06-27 02:46:24.240966
9	Printer Troubleshooting and Setup Guide	printer-troubleshooting-setup	Printer problems can disrupt productivity. Here's how to diagnose and fix common issues:\n\n**Common Printer Problems:**\n\n1. **Printer Won't Print:**\n   - Check power and USB/network connections\n   - Verify printer is set as default\n   - Clear print queue of stuck jobs\n   - Restart Print Spooler service\n   - Update or reinstall printer drivers\n\n2. **Poor Print Quality:**\n   - Check ink/toner levels\n   - Run printer head cleaning utility\n   - Align print heads\n   - Use appropriate paper type settings\n   - Replace old or dried ink cartridges\n\n3. **Network Printer Connection Issues:**\n   - Verify printer IP address\n   - Check network connectivity\n   - Restart printer and router\n   - Reinstall network printer\n   - Update printer firmware\n\n**Printer Setup Instructions:**\n\n**USB Printer Setup:**\n1. Connect USB cable to computer\n2. Windows should auto-detect and install\n3. If not detected, download drivers from manufacturer\n4. Add printer through Settings > Printers & Scanners\n\n**Network Printer Setup:**\n1. Connect printer to WiFi network\n2. Print network configuration page\n3. Add printer using IP address\n4. Install appropriate drivers\n5. Test print functionality\n\n**Advanced Troubleshooting:**\n\n**Driver Issues:**\n- Download latest drivers from manufacturer website\n- Uninstall old drivers completely before reinstalling\n- Use Windows generic drivers if specific drivers fail\n- Run Windows printer troubleshooter\n\n**Print Spooler Problems:**\n1. Open Services (services.msc)\n2. Stop Print Spooler service\n3. Delete files in C:\\\\Windows\\\\System32\\\\spool\\\\PRINTERS\n4. Restart Print Spooler service\n5. Try printing again\n\n**Business Printing Solutions:**\n\n**Multi-Function Devices:**\n- Copy, scan, fax capabilities\n- Network scanning to email/folders\n- Mobile printing support\n- Advanced security features\n\n**Print Management:**\n- Centralized print server setup\n- User authentication and quotas\n- Print job tracking and reporting\n- Automatic driver deployment\n\n**Maintenance Tips:**\n- Regular cleaning cycles\n- Use genuine ink/toner when possible\n- Keep printer firmware updated\n- Maintain optimal operating environment\n\nAramisTech provides professional printer setup, troubleshooting, and managed print services for businesses. Get expert printer support - call (305) 814-4461.	Comprehensive printer troubleshooting guide covering setup, connection issues, print quality problems, and business printing solutions.	1	{"printer problems","print quality","network printing","driver issues","business printing"}	t	0	4	Printer Troubleshooting and Setup Guide | AramisTech IT Support	Professional printer troubleshooting guide with setup instructions and business printing solutions from AramisTech experts.	2025-06-27 02:46:24.240966	2025-06-27 02:46:24.240966
10	Hard Drive Failure Warning Signs	hard-drive-failure-warning-signs	Hard drive failures can cause catastrophic data loss. Recognize these warning signs before it's too late:\n\n**Early Warning Signs:**\n\n1. **Unusual Noises:**\n   - Clicking or grinding sounds\n   - Whirring or buzzing noises\n   - Repeated beeping during startup\n   - These sounds indicate mechanical failure\n\n2. **Performance Issues:**\n   - Extremely slow file access\n   - Frequent system freezes\n   - Programs taking longer to load\n   - File transfer speeds much slower than normal\n\n3. **System Error Messages:**\n   - "Hard disk error" notifications\n   - Blue screen errors mentioning disk\n   - Files becoming corrupted or unreadable\n   - Operating system boot failures\n\n**Advanced Warning Signs:**\n\n4. **S.M.A.R.T. Errors:**\n   - Download CrystalDiskInfo to check drive health\n   - Look for reallocated sectors\n   - High error count readings\n   - Temperature warnings\n\n5. **File System Problems:**\n   - Frequent disk check requests\n   - Files mysteriously disappearing\n   - Cannot save files to specific locations\n   - Folder structure corruption\n\n**Immediate Actions to Take:**\n\n**If You Suspect Drive Failure:**\n1. **Stop using the computer immediately**\n2. **Do not run disk repair tools** (can make recovery worse)\n3. **Power down the system safely**\n4. **Contact data recovery professionals**\n\n**Data Recovery Steps:**\n- Create disk image if drive still accessible\n- Use professional data recovery services\n- Attempt recovery on a different computer\n- Never open the drive yourself\n\n**Prevention Strategies:**\n- Regular data backups (3-2-1 rule)\n- Monitor drive health monthly\n- Maintain proper computer ventilation\n- Replace drives every 3-5 years\n- Use surge protectors\n\n**Professional Recovery Services:**\n- Clean room data recovery\n- Hardware repair and replacement\n- Emergency 24/7 service available\n- Success rates up to 95% for mechanical failures\n\nAramisTech provides immediate data recovery services and can often recover data from failed drives. Time is critical - call (305) 814-4461 for emergency data recovery assistance.	Learn to recognize hard drive failure warning signs and take immediate action to prevent permanent data loss.	4	{"hard drive","data recovery","hardware failure","warning signs",prevention}	t	0	1	Hard Drive Failure Warning Signs | AramisTech Data Recovery	Recognize hard drive failure warning signs before data loss occurs. Professional data recovery services available from AramisTech.	2025-06-27 02:48:04.331954	2025-06-27 02:48:04.331954
11	Computer Running Hot - Overheating Solutions	computer-overheating-solutions	Computer overheating can cause permanent hardware damage. Here's how to diagnose and fix overheating issues:\n\n**Signs of Overheating:**\n\n1. **Performance Symptoms:**\n   - Computer randomly shuts down\n   - Frequent blue screen errors\n   - System running extremely slow\n   - Fan noise constantly loud\n   - Programs crashing unexpectedly\n\n2. **Physical Signs:**\n   - Computer case feels very hot\n   - Loud or constant fan operation\n   - Burning smell from computer\n   - Screen artifacts or display issues\n\n**Temperature Monitoring:**\n\n**Check Current Temperatures:**\n- Download HWMonitor or Core Temp\n- Monitor CPU temperatures during use\n- Normal: 30-40°C idle, 60-70°C under load\n- Concerning: 80°C+, Critical: 90°C+\n\n**Cooling Solutions:**\n\n3. **Immediate Fixes:**\n   - Clean dust from vents and fans\n   - Ensure all vents are unobstructed\n   - Use compressed air to blow out dust\n   - Check that all fans are spinning\n\n4. **Internal Cleaning:**\n   - Power down and unplug computer\n   - Remove side panel carefully\n   - Use compressed air on components\n   - Clean heat sinks and fan blades\n   - Reapply thermal paste if needed\n\n5. **Airflow Improvements:**\n   - Reorganize internal cables\n   - Add case fans if needed\n   - Ensure intake and exhaust balance\n   - Consider liquid cooling for high-performance systems\n\n**Environmental Factors:**\n\n6. **Room Temperature:**\n   - Keep computer in cool, well-ventilated area\n   - Avoid direct sunlight\n   - Maintain room temperature below 75°F\n   - Use air conditioning during hot weather\n\n7. **Computer Placement:**\n   - Elevate laptop for better airflow\n   - Don't block ventilation holes\n   - Use laptop cooling pads\n   - Keep desktop away from heat sources\n\n**Advanced Solutions:**\n\n8. **Hardware Upgrades:**\n   - Replace failing fans\n   - Upgrade CPU cooler\n   - Add more case fans\n   - Consider liquid cooling systems\n\n9. **Software Optimization:**\n   - Close unnecessary programs\n   - Update device drivers\n   - Check for malware causing high CPU usage\n   - Adjust power settings for cooler operation\n\n**When to Seek Professional Help:**\n- Temperature readings consistently above 80°C\n- Computer shutdowns continue after cleaning\n- Strange noises from cooling fans\n- Thermal paste replacement needed\n\nAramisTech provides professional computer cleaning, thermal management, and cooling system upgrades. Protect your investment with expert cooling solutions - call (305) 814-4461.	Complete guide to diagnosing and fixing computer overheating issues including cleaning, monitoring, and cooling solutions.	4	{overheating,"computer cooling","thermal management","fan cleaning","temperature monitoring"}	t	0	2	Computer Overheating Solutions - Cooling and Temperature Guide | AramisTech	Fix computer overheating issues with professional cooling solutions and thermal management from AramisTech hardware experts.	2025-06-27 02:48:04.331954	2025-06-27 02:48:04.331954
7	Windows Update Problems - Diagnosis and Fixes	windows-update-problems	Windows updates are essential for security, but they can sometimes cause issues. Here's how to troubleshoot:\n\n**Common Windows Update Problems:**\n\n1. **Updates Won't Download:**\n   - Check internet connection stability\n   - Restart Windows Update service\n   - Clear Windows Update cache\n   - Run Windows Update Troubleshooter\n\n2. **Update Installation Failures:**\n   - Free up disk space (need at least 20GB)\n   - Disconnect unnecessary USB devices\n   - Run System File Checker (sfc /scannow)\n   - Use DISM tool to repair system image\n\n3. **Computer Won't Start After Update:**\n   - Boot into Safe Mode\n   - Use System Restore to previous point\n   - Uninstall recent updates if problematic\n   - Access Advanced Startup Options\n\n**Step-by-Step Troubleshooting:**\n\n**Method 1: Reset Windows Update Components**\n1. Press Win+R, type "services.msc"\n2. Stop Windows Update service\n3. Delete contents of C:\\\\Windows\\\\SoftwareDistribution\n4. Restart Windows Update service\n5. Try updating again\n\n**Method 2: Run Update Troubleshooter**\n1. Go to Settings > Update & Security\n2. Click Troubleshoot > Windows Update\n3. Run the troubleshooter and follow instructions\n4. Restart computer and try updating\n\n**Method 3: Manual Update Download**\n1. Visit Microsoft Update Catalog\n2. Search for specific update KB number\n3. Download update manually\n4. Install update file directly\n\n**Prevention Tips:**\n- Regularly restart your computer\n- Maintain adequate free disk space\n- Keep antivirus software updated\n- Create system restore points before major updates\n\n**When to Seek Professional Help:**\n- Blue screen errors after updates\n- Repeated update failures\n- System performance issues\n- Hardware compatibility problems\n\nAramisTech provides professional Windows troubleshooting and system maintenance. Don't let update problems disrupt your work - call (305) 814-4461 for expert assistance.	Comprehensive troubleshooting guide for Windows update problems including download failures, installation errors, and system recovery.	1	{"windows updates","system troubleshooting","installation problems","error fixes","system maintenance"}	t	1	3	Windows Update Problems - Complete Troubleshooting Guide | AramisTech	Fix Windows update issues with professional troubleshooting steps. Expert Windows support available from AramisTech IT specialists.	2025-06-27 02:46:24.240966	2025-06-27 02:46:24.240966
15	Virus and Malware Removal Guide	virus-malware-removal-guide	Malware infections can compromise your data and privacy. Here's how to detect, remove, and prevent malware:\n\n**Signs of Malware Infection:**\n\n1. **Performance Symptoms:**\n   - Computer running extremely slow\n   - Programs taking longer to start\n   - Frequent system crashes or freezes\n   - High CPU usage with no apparent cause\n   - Internet connection slower than normal\n\n2. **Suspicious Activity:**\n   - Pop-up ads appearing constantly\n   - Browser homepage changed without permission\n   - New toolbars or browser extensions\n   - Unknown programs in startup menu\n   - Files or money missing from accounts\n\n**Immediate Response Steps:**\n\n3. **Disconnect from Internet:**\n   - Prevents data theft and further infection\n   - Stops malware from communicating with servers\n   - Protects other devices on network\n   - Allows focused cleaning without interference\n\n4. **Boot into Safe Mode:**\n   - Restart computer and press F8 during startup\n   - Select "Safe Mode with Networking"\n   - This prevents most malware from running\n   - Allows security software to work effectively\n\n**Malware Removal Process:**\n\n5. **Update Security Software:**\n   - Ensure antivirus definitions are current\n   - Download updates in Safe Mode if needed\n   - Use multiple scanning tools for thorough cleaning\n   - Don't rely on single antivirus program\n\n6. **Recommended Removal Tools:**\n   - Malwarebytes Anti-Malware (excellent detection)\n   - Windows Defender (built-in, always run first)\n   - Spybot Search & Destroy (spyware specialist)\n   - AdwCleaner (removes adware and toolbars)\n   - ESET Online Scanner (second opinion scan)\n\n**Step-by-Step Removal:**\n\n7. **First Scan Phase:**\n   - Run Windows Defender full scan\n   - Run Malwarebytes full scan\n   - Quarantine or delete all threats found\n   - Restart computer and scan again\n\n8. **Deep Cleaning Phase:**\n   - Use AdwCleaner for browser cleanup\n   - Run ESET Online Scanner\n   - Check browser extensions and remove suspicious ones\n   - Reset browser settings if heavily infected\n\n**Manual Cleanup Tasks:**\n\n9. **System File Cleanup:**\n   - Run System File Checker (sfc /scannow)\n   - Use DISM tool to repair system image\n   - Clear temporary files and browser cache\n   - Check startup programs and disable suspicious ones\n\n10. **Browser Restoration:**\n    - Reset browser to default settings\n    - Remove unknown extensions and toolbars\n    - Change passwords after cleaning\n    - Clear all saved passwords and cookies\n\n**Prevention Strategies:**\n\n11. **Security Software:**\n    - Use reputable antivirus with real-time protection\n    - Keep security software updated automatically\n    - Enable firewall protection\n    - Use anti-malware alongside antivirus\n\n12. **Safe Computing Practices:**\n    - Don't click suspicious email links\n    - Avoid downloading from unknown websites\n    - Keep operating system and software updated\n    - Use standard user accounts, not administrator\n\n**Advanced Threats:**\n\n13. **Rootkit Detection:**\n    - Use specialized rootkit scanners\n    - Malwarebytes Anti-Rootkit (MBAR)\n    - RootkitRevealer by Microsoft\n    - May require professional removal\n\n14. **Ransomware Response:**\n    - Never pay the ransom\n    - Disconnect from network immediately\n    - Restore from clean backups\n    - Report to law enforcement\n    - Seek professional help for decryption\n\n**When to Seek Professional Help:**\n- Multiple infections that keep returning\n- System won't boot properly\n- Important files are encrypted (ransomware)\n- Banking or personal information compromised\n- Business networks with multiple infected computers\n\nAramisTech provides professional malware removal, system cleaning, and cybersecurity services. We handle the most stubborn infections and provide comprehensive security solutions - call (305) 814-4461 for immediate assistance.	Complete malware removal guide covering detection, removal tools, cleanup procedures, and prevention strategies.	2	{"malware removal","virus cleaning",cybersecurity,antivirus,"system security"}	t	0	4	Virus and Malware Removal Guide | AramisTech Cybersecurity	Professional virus and malware removal guide with step-by-step cleanup procedures. Expert malware removal services from AramisTech.	2025-06-27 02:48:04.331954	2025-06-27 02:48:04.331954
3	WiFi Connection Problems - Quick Fixes	wifi-connection-problems	Having trouble with your WiFi connection? Try these solutions:\n\n**Basic Troubleshooting:**\n\n1. Check if WiFi is enabled\n- Look for WiFi icon in system tray\n- Make sure airplane mode is off\n- Try connecting to a different network\n\n2. Restart your devices\n- Restart your computer or device\n- Unplug router for 30 seconds, then plug back in\n- Wait 2-3 minutes for full restart\n\n3. Check signal strength\n- Move closer to the router\n- Remove obstacles between device and router\n- Check for interference from other devices\n\n**Advanced Solutions:**\n\n4. Update network drivers\n- Go to Device Manager\n- Update network adapter drivers\n- Restart computer after updating\n\n5. Reset network settings\n- Run Windows Network Troubleshooter\n- Reset TCP/IP stack\n- Forget and reconnect to WiFi network\n\n6. Check router settings\n- Ensure DHCP is enabled\n- Check for firmware updates\n- Reset router to factory settings if needed\n\nStill having issues? AramisTech provides professional network troubleshooting and setup. Call (305) 814-4461 for expert assistance.	Step-by-step guide to diagnose and fix common WiFi connectivity issues for home and business networks.	3	{wifi,network,connectivity,troubleshooting,internet}	t	1	1	WiFi Connection Problems - Troubleshooting Guide | AramisTech	Fix common WiFi connectivity issues with our comprehensive troubleshooting guide. Professional network support available.	2025-06-27 02:40:29.14796	2025-06-27 02:40:29.14796
18	Office 365 Mobile Email Troubleshooting Guide	office-365-mobile-troubleshooting	Solve common Office 365 mobile email problems with professional troubleshooting techniques:\n\n**Most Common Mobile Email Issues:**\n\n1. **Email Not Syncing:**\n   - Check internet connection (WiFi and cellular)\n   - Verify account credentials haven't changed\n   - Check mailbox storage limits\n   - Restart email app completely\n   - Force refresh/pull to sync\n\n2. **Authentication Failures:**\n   - Password may have expired or been changed\n   - Two-factor authentication token expired\n   - Account may be locked due to security policy\n   - App-specific password needed for some configurations\n\n3. **Missing Emails or Folders:**\n   - Check sync settings (may be set to recent emails only)\n   - Verify folder permissions with IT department\n   - Check if emails are in different folder/archive\n   - Ensure proper Exchange permissions\n\n**iPhone-Specific Troubleshooting:**\n\n4. **iOS Mail App Issues:**\n   - Go to Settings > Mail > Accounts\n   - Select Exchange account\n   - Turn off Mail, wait 30 seconds, turn back on\n   - Check "Mail Days to Sync" setting\n   - Verify push/fetch settings\n\n5. **Calendar/Contacts Not Syncing:**\n   - Toggle Calendar and Contacts off/on in account settings\n   - Check for conflicting calendar apps\n   - Verify time zone settings match Exchange server\n   - Restart Contacts and Calendar apps\n\n**Android-Specific Troubleshooting:**\n\n6. **Outlook App Problems:**\n   - Clear Outlook app cache: Settings > Apps > Outlook > Storage > Clear Cache\n   - Force stop and restart Outlook app\n   - Check app permissions for contacts/calendar access\n   - Update Outlook app to latest version\n\n7. **Gmail App Exchange Issues:**\n   - Remove and re-add Exchange account\n   - Check Gmail app supports Exchange (some older versions don't)\n   - Verify OAuth2 authentication is working\n   - Try using IMAP instead of Exchange ActiveSync\n\n**Advanced Troubleshooting Steps:**\n\n8. **Network and Connectivity:**\n   - Test with different networks (WiFi vs cellular)\n   - Check if corporate firewall blocks mobile access\n   - Verify DNS settings on mobile network\n   - Test Exchange web access from mobile browser\n\n9. **Server-Side Issues:**\n   - Check Office 365 service status\n   - Verify Exchange Online is accessible\n   - Check for planned maintenance windows\n   - Contact IT for server-side troubleshooting\n\n**Security-Related Problems:**\n\n10. **Conditional Access Issues:**\n    - Device may not meet compliance requirements\n    - Company may require device enrollment\n    - Install required security apps (Company Portal, Authenticator)\n    - Check if device is approved for email access\n\n11. **Certificate Problems:**\n    - Install required company certificates\n    - Check certificate expiration dates\n    - Clear SSL certificate cache\n    - Verify device trusts Exchange server certificate\n\n**Performance Issues:**\n\n12. **Slow Email Loading:**\n    - Reduce sync period (sync fewer days of email)\n    - Disable automatic image loading\n    - Clear email app cache regularly\n    - Check device storage space\n\n13. **Battery Drain from Email:**\n    - Adjust push notification frequency\n    - Set email to fetch instead of push\n    - Reduce background app refresh\n    - Use power-saving modes when needed\n\n**Data and Storage Issues:**\n\n14. **Mailbox Full Errors:**\n    - Archive old emails to reduce mailbox size\n    - Empty deleted items folder\n    - Check Office 365 storage limits\n    - Move large attachments to OneDrive\n\n15. **Attachment Problems:**\n    - Check file size limits for mobile\n    - Verify attachment types are allowed\n    - Try viewing attachments in web browser\n    - Download attachments to device storage\n\n**Step-by-Step Reset Procedures:**\n\n16. **Complete Account Reset (iOS):**\n    - Settings > Mail > Accounts > [Account] > Delete Account\n    - Restart iPhone\n    - Re-add account with fresh settings\n    - Test all functionality (mail, calendar, contacts)\n\n17. **Complete Account Reset (Android):**\n    - Remove account from all email apps\n    - Clear cache for all email-related apps\n    - Restart Android device\n    - Set up account fresh with current credentials\n\n**When to Escalate to IT Support:**\n\n18. **Company Policy Issues:**\n    - Device compliance requirements\n    - Mobile device management conflicts\n    - Exchange server configuration problems\n    - Active Directory authentication issues\n\n19. **Advanced Exchange Problems:**\n    - PowerShell-level troubleshooting needed\n    - Exchange server mailbox issues\n    - Office 365 tenant configuration problems\n    - Complex multi-domain setups\n\n**Preventive Maintenance:**\n\n20. **Regular Maintenance Tasks:**\n    - Keep mobile OS updated\n    - Update email apps regularly\n    - Clear cache monthly\n    - Review and clean up email folders\n    - Test backup and restore procedures\n\n**Documentation for IT Support:**\n- Note specific error messages\n- Record when problem started\n- Document troubleshooting steps already tried\n- Include device model and OS version\n- Screenshot error messages when possible\n\n**Emergency Email Access:**\n- Use Outlook Web App (OWA) through mobile browser\n- Access through company VPN if required\n- Use alternative device if primary fails\n- Contact IT immediately for critical business needs\n\nExperiencing persistent Office 365 mobile email issues? AramisTech provides professional mobile email troubleshooting and enterprise mobility support. Our experts can resolve complex Exchange issues and optimize your mobile email experience - call (305) 814-4461 for immediate assistance.	Complete troubleshooting guide for Office 365 mobile email issues covering iPhone, Android, and common Exchange problems.	1	{"office 365","mobile email",troubleshooting,exchange,iphone,android}	t	0	5	Office 365 Mobile Email Troubleshooting Guide | AramisTech Support	Professional Office 365 mobile email troubleshooting guide. Expert Exchange and mobile email support from AramisTech IT specialists.	2025-06-27 02:55:43.257578	2025-06-27 02:55:43.257578
19	Setting Up Google Workspace Email on iPhone	google-workspace-email-iphone-setup	Configure your Google Workspace (formerly G Suite) email on iPhone for seamless business communication:\n\n**Before You Begin:**\n- Have your Google Workspace email address and password ready\n- Ensure two-factor authentication is configured if enabled\n- Connect to reliable WiFi for faster setup\n- Update iOS to the latest version for optimal compatibility\n\n**Method 1: Using Gmail App (Recommended):**\n\n1. **Download Gmail App:**\n   - Install Gmail from the App Store\n   - Official Google app with full Workspace features\n   - Best integration with Google services\n   - Supports multiple accounts and advanced features\n\n2. **Add Your Workspace Account:**\n   - Open Gmail app\n   - Tap profile picture or "Add account"\n   - Select "Google"\n   - Enter your Google Workspace email address\n   - Tap "Next"\n\n3. **Complete Authentication:**\n   - Enter your Workspace password\n   - Complete 2-step verification if prompted\n   - Allow Gmail to access your account\n   - Choose notification preferences\n\n**Method 2: Using iPhone Mail App:**\n\n4. **Add Google Account to Mail:**\n   - Open Settings > Mail > Accounts\n   - Tap "Add Account"\n   - Select "Google"\n   - Enter your Workspace email address\n   - Tap "Next"\n\n5. **Sign In and Authorize:**\n   - Enter your Google Workspace password\n   - Complete two-factor authentication if required\n   - Allow iOS to access your Google account\n   - Choose what to sync (Mail, Contacts, Calendars, Notes)\n\n6. **Configure Sync Options:**\n   - Mail: ON (required for email)\n   - Contacts: ON (syncs Workspace contacts)\n   - Calendars: ON (syncs Google Calendar)\n   - Notes: Optional (syncs Google Keep notes)\n   - Tap "Save"\n\n**Calendar Integration:**\n\n7. **Google Calendar Setup:**\n   - Open Calendar app on iPhone\n   - Verify Google calendars appear\n   - Check shared calendars from colleagues\n   - Set default calendar for new events\n   - Configure meeting notifications\n\n8. **Calendar Permissions:**\n   - Allow Calendar app to send notifications\n   - Set up meeting alerts and reminders\n   - Configure time zone settings\n   - Enable location-based reminders if needed\n\n**Contacts Synchronization:**\n\n9. **Google Contacts Setup:**\n   - Open Contacts app\n   - Verify Workspace contacts sync\n   - Check company directory access\n   - Test contact search functionality\n   - Set up contact groups if available\n\n10. **Directory Integration:**\n    - Access company Global Address List\n    - Search for colleagues by name or department\n    - Add frequently contacted people to favorites\n    - Sync contact photos and details\n\n**Advanced Configuration:**\n\n11. **Push Notifications:**\n    - Go to Settings > Notifications > Mail\n    - Select your Google Workspace account\n    - Enable notifications for new mail\n    - Customize alert style and sounds\n    - Set up VIP notifications for important contacts\n\n12. **Fetch Settings:**\n    - Settings > Mail > Accounts > Fetch New Data\n    - Set Google account to "Push" for instant delivery\n    - Adjust fetch frequency for battery optimization\n    - Use "Automatically" for smart power management\n\n**Security Features:**\n\n13. **Two-Factor Authentication:**\n    - Install Google Authenticator app if required\n    - Set up backup codes for account recovery\n    - Use company-approved authentication methods\n    - Keep backup verification methods updated\n\n14. **App-Specific Passwords:**\n    - Generate app password if standard login fails\n    - Use for enhanced security configurations\n    - Store securely in iOS Keychain\n    - Rotate passwords according to company policy\n\n**Email Management:**\n\n15. **Signature Setup:**\n    - Settings > Mail > Signature\n    - Create professional business signature\n    - Include company contact information\n    - Keep mobile-friendly and concise\n    - Use consistent branding\n\n16. **Email Organization:**\n    - Set up important mail folders\n    - Configure VIP list for key contacts\n    - Use Gmail labels for organization\n    - Set up filters for automated sorting\n\n**Google Workspace Features:**\n\n17. **Drive Integration:**\n    - Install Google Drive app\n    - Access shared company files\n    - Open email attachments in Drive\n    - Collaborate on documents from mobile\n\n18. **Meet Integration:**\n    - Join Google Meet calls from calendar\n    - One-tap meeting access from invitations\n    - Use Google Meet mobile app for full features\n    - Access meeting recordings and chat\n\n**Troubleshooting Common Issues:**\n\n19. **Authentication Problems:**\n    - Verify correct Workspace domain\n    - Check for account lockouts or restrictions\n    - Clear stored passwords and re-authenticate\n    - Contact IT for domain-specific issues\n\n20. **Sync Issues:**\n    - Check internet connectivity\n    - Restart Mail and Calendar apps\n    - Remove and re-add account if needed\n    - Verify Google Workspace service status\n\n21. **Missing Features:**\n    - Update iOS to latest version\n    - Check Workspace admin settings\n    - Verify account permissions\n    - Install latest Gmail app version\n\n**Business Productivity Tips:**\n\n22. **Offline Access:**\n    - Enable offline Gmail in app settings\n    - Download important emails for offline reading\n    - Sync recent calendar events\n    - Access Drive files offline when needed\n\n23. **Integration with Other Apps:**\n    - Connect with third-party productivity apps\n    - Use Siri shortcuts for quick email actions\n    - Set up workflow automations\n    - Integrate with business communication tools\n\n**Mobile Device Management:**\n\n24. **Company Policies:**\n    - Follow organizational mobile device policies\n    - Install required security certificates\n    - Allow device management if required\n    - Understand remote wipe capabilities\n\n25. **Data Protection:**\n    - Use device passcode/biometric security\n    - Enable automatic app lock\n    - Avoid public WiFi for sensitive emails\n    - Regular backup of device data\n\nNeed professional Google Workspace setup or mobile device management for your business? AramisTech provides expert configuration services and ongoing support for Google Workspace deployments. Contact us at (305) 814-4461 for comprehensive business email solutions.	Complete guide to setting up Google Workspace email on iPhone with Gmail app and native Mail app configuration options.	5	{"google workspace",gmail,iphone,"email setup","mobile email",ios,"g suite"}	t	0	4	Google Workspace Email Setup on iPhone | AramisTech Business Email	Step-by-step Google Workspace email setup guide for iPhone. Professional business email configuration from AramisTech.	2025-06-27 02:58:09.966533	2025-06-27 02:58:09.966533
20	Setting Up Google Workspace Email on Android	google-workspace-email-android-setup	Configure Google Workspace email on Android devices for optimal business productivity and collaboration:\n\n**Prerequisites:**\n- Google Workspace email address and password\n- Two-factor authentication setup (if required by organization)\n- Stable internet connection for initial setup\n- Latest Android version for best compatibility\n\n**Method 1: Using Gmail App (Recommended):**\n\n1. **Gmail App Setup:**\n   - Gmail app is pre-installed on most Android devices\n   - If not installed, download from Google Play Store\n   - Provides full Google Workspace feature integration\n   - Supports multiple account management\n\n2. **Add Workspace Account:**\n   - Open Gmail app\n   - Tap profile picture in top right\n   - Select "Add another account"\n   - Choose "Google"\n   - Enter your Workspace email address\n\n3. **Authentication Process:**\n   - Enter your Google Workspace password\n   - Complete 2-step verification if prompted\n   - Allow Gmail access to your account\n   - Configure notification preferences\n\n4. **Account Verification:**\n   - Verify account appears in Gmail app\n   - Check that company branding displays correctly\n   - Test sending and receiving emails\n   - Confirm access to shared folders\n\n**Method 2: Using Default Email App:**\n\n5. **Android Email App Setup:**\n   - Open default Email or Mail app\n   - Tap "Add Account"\n   - Select "Google" or "Gmail"\n   - Enter Workspace email credentials\n   - Follow authentication prompts\n\n6. **IMAP/POP Configuration (If Needed):**\n   - Incoming server: imap.gmail.com\n   - Port: 993 (IMAP) or 995 (POP3)\n   - Security: SSL/TLS\n   - Outgoing server: smtp.gmail.com\n   - SMTP Port: 587 or 465\n   - Authentication required: Yes\n\n**Google Services Integration:**\n\n7. **Calendar Setup:**\n   - Open Google Calendar app\n   - Verify Workspace calendars sync automatically\n   - Check shared team calendars\n   - Configure meeting notifications\n   - Set up multiple calendar views\n\n8. **Contacts Synchronization:**\n   - Open Contacts app\n   - Verify Google Workspace contacts appear\n   - Check company directory access\n   - Test contact search and autocomplete\n   - Sync contact photos and details\n\n9. **Drive Integration:**\n   - Install Google Drive app if not present\n   - Sign in with Workspace credentials\n   - Access shared company files and folders\n   - Set up offline file access\n   - Configure file sharing permissions\n\n**Advanced Features Configuration:**\n\n10. **Google Meet Setup:**\n    - Install Google Meet app\n    - Sign in with Workspace account\n    - Join meetings directly from calendar invites\n    - Set up meeting preferences and audio/video settings\n    - Access meeting recordings and chat history\n\n11. **Google Chat Integration:**\n    - Install Google Chat app (if using)\n    - Connect with team members and spaces\n    - Set up notification preferences\n    - Access shared files and conversations\n    - Configure status and availability settings\n\n**Security Configuration:**\n\n12. **Two-Factor Authentication:**\n    - Install Google Authenticator app\n    - Set up backup codes for account recovery\n    - Configure trusted devices\n    - Enable security key support if available\n\n13. **Device Security:**\n    - Enable device screen lock (PIN, pattern, biometric)\n    - Set up device encryption\n    - Configure app lock for sensitive apps\n    - Enable remote device management if required\n\n**Notification Management:**\n\n14. **Email Notifications:**\n    - Configure push notifications for priority emails\n    - Set up quiet hours for work-life balance\n    - Customize notification sounds per account\n    - Use priority inbox for important messages\n\n15. **Calendar Notifications:**\n    - Set default meeting reminders\n    - Configure location-based notifications\n    - Enable smart suggestions for meeting preparation\n    - Set up recurring event notifications\n\n**Performance Optimization:**\n\n16. **Sync Settings:**\n    - Configure sync frequency for battery optimization\n    - Choose which data to sync (mail, calendar, contacts)\n    - Set up selective sync for large mailboxes\n    - Enable background app refresh strategically\n\n17. **Storage Management:**\n    - Monitor Gmail storage usage\n    - Set up automatic email deletion policies\n    - Archive old emails to free space\n    - Use Google Photos for attachment management\n\n**Business Productivity Features:**\n\n18. **Smart Reply and Compose:**\n    - Enable AI-powered email suggestions\n    - Use Quick Reply for faster responses\n    - Set up email templates for common replies\n    - Configure smart scheduling suggestions\n\n19. **Offline Access:**\n    - Enable offline Gmail for important emails\n    - Download recent messages for offline reading\n    - Access Drive files offline\n    - Sync calendar events for offline viewing\n\n**Multi-Account Management:**\n\n20. **Managing Multiple Accounts:**\n    - Add personal Gmail alongside Workspace account\n    - Switch between accounts seamlessly\n    - Configure different notification settings per account\n    - Set up account-specific signatures\n\n21. **Default Account Settings:**\n    - Set Workspace account as default for business\n    - Configure which account opens for different actions\n    - Manage default calendar for new events\n    - Set primary account for Drive file creation\n\n**Enterprise Features:**\n\n22. **Mobile Device Management (MDM):**\n    - Install Google Admin app if required\n    - Accept enterprise mobile policies\n    - Allow device compliance monitoring\n    - Understand data protection measures\n\n23. **Data Loss Prevention:**\n    - Follow company data handling policies\n    - Use approved apps for business data\n    - Enable automatic backup for business files\n    - Comply with retention and deletion policies\n\n**Troubleshooting Common Issues:**\n\n24. **Sync Problems:**\n    - Check internet connection and data usage\n    - Clear Gmail app cache and data\n    - Remove and re-add account\n    - Verify Google Workspace service status\n\n25. **Authentication Issues:**\n    - Verify correct domain and credentials\n    - Check for account locks or restrictions\n    - Generate app-specific password if needed\n    - Contact IT administrator for domain issues\n\n26. **Performance Issues:**\n    - Update all Google apps to latest versions\n    - Restart device to clear memory\n    - Check available storage space\n    - Disable unnecessary sync options\n\n**Advanced Configuration:**\n\n27. **Custom Domain Setup:**\n    - Verify custom domain email routing\n    - Check MX record configuration with IT\n    - Test email delivery to external addresses\n    - Confirm proper SPF/DKIM setup\n\n28. **Integration with Third-Party Apps:**\n    - Connect approved business applications\n    - Set up workflow automation tools\n    - Configure CRM integration if available\n    - Use business communication platforms\n\nNeed expert Google Workspace deployment or Android device management? AramisTech provides comprehensive Google Workspace setup, migration, and ongoing support services. Our certified technicians ensure optimal configuration for business productivity - call (305) 814-4461 for professional assistance.	Comprehensive guide to setting up Google Workspace email on Android with full integration of business productivity features.	5	{"google workspace",gmail,android,"email setup","mobile email","g suite","business email"}	t	0	5	Google Workspace Email Setup on Android | AramisTech Business Solutions	Complete Android Google Workspace email setup guide. Professional business email configuration and support from AramisTech.	2025-06-27 02:58:09.966533	2025-06-27 02:58:09.966533
21	Google Workspace vs Office 365 Mobile Setup Comparison	google-workspace-vs-office-365-mobile	Compare Google Workspace and Office 365 mobile email setup to choose the best solution for your business:\n\n**Platform Overview:**\n\n**Google Workspace (formerly G Suite):**\n- Gmail-based email system\n- Integrated Google apps (Drive, Calendar, Meet)\n- Strong collaboration features\n- Web-first design philosophy\n- Simplified mobile setup process\n\n**Microsoft Office 365:**\n- Exchange-based email system\n- Integrated Microsoft apps (OneDrive, Teams, Office)\n- Enterprise-focused features\n- Desktop-first with mobile integration\n- More complex but feature-rich setup\n\n**Mobile Setup Complexity:**\n\n1. **Google Workspace Setup:**\n   - Generally easier and faster setup\n   - Automatic configuration in most cases\n   - Single sign-on across all Google services\n   - Minimal manual configuration required\n   - Works well with both Gmail app and native email apps\n\n2. **Office 365 Setup:**\n   - More configuration options available\n   - May require manual server settings\n   - Multiple authentication methods\n   - More enterprise security features\n   - Better integration with Windows devices\n\n**Feature Comparison on Mobile:**\n\n3. **Email Features:**\n   \n   **Google Workspace:**\n   - Priority Inbox and smart categorization\n   - Powerful search capabilities\n   - Gmail labels and filters\n   - Smart Reply and Smart Compose\n   - Excellent spam filtering\n\n   **Office 365:**\n   - Focused Inbox feature\n   - Advanced rule-based filtering\n   - Conversation threading\n   - Integration with Outlook desktop\n   - Robust archiving capabilities\n\n4. **Calendar Integration:**\n   \n   **Google Workspace:**\n   - Google Calendar with smart scheduling\n   - Room and resource booking\n   - Multiple calendar support\n   - Easy sharing and collaboration\n   - Integration with Google Meet\n\n   **Office 365:**\n   - Outlook Calendar with advanced features\n   - Meeting room management\n   - Scheduling assistant\n   - Integration with Microsoft Teams\n   - Better time zone handling\n\n**Security Comparison:**\n\n5. **Authentication Options:**\n   \n   **Google Workspace:**\n   - Google 2-step verification\n   - Security keys support\n   - OAuth 2.0 authentication\n   - App passwords for legacy apps\n   - Advanced Protection Program\n\n   **Office 365:**\n   - Multi-factor authentication\n   - Conditional access policies\n   - Modern authentication protocols\n   - App-specific passwords\n   - Windows Hello integration\n\n6. **Mobile Device Management:**\n   \n   **Google Workspace:**\n   - Google Admin console for device management\n   - Basic mobile application management\n   - Remote wipe capabilities\n   - Device compliance policies\n   - Integration with Chrome Enterprise\n\n   **Office 365:**\n   - Microsoft Intune for comprehensive MDM\n   - Advanced application protection policies\n   - Conditional access based on device compliance\n   - More granular control options\n   - Integration with Windows Autopilot\n\n**Performance and Reliability:**\n\n7. **Offline Capabilities:**\n   \n   **Google Workspace:**\n   - Limited offline email access in Gmail app\n   - Offline Google Docs editing\n   - Google Drive offline file access\n   - Calendar offline viewing\n   - Requires specific setup for offline use\n\n   **Office 365:**\n   - Robust offline email capabilities\n   - Full Outlook offline functionality\n   - OneDrive offline file synchronization\n   - Office mobile apps offline editing\n   - Better offline experience overall\n\n8. **Synchronization Speed:**\n   \n   **Google Workspace:**\n   - Fast push email delivery\n   - Real-time collaboration updates\n   - Quick calendar synchronization\n   - Efficient delta sync for large mailboxes\n   - Good performance on slower connections\n\n   **Office 365:**\n   - Excellent Exchange ActiveSync performance\n   - Fast calendar and contact sync\n   - Efficient large attachment handling\n   - Better performance with large mailboxes\n   - Optimized for business networks\n\n**Cost and Licensing:**\n\n9. **Mobile App Costs:**\n   \n   **Google Workspace:**\n   - Gmail app is free\n   - All Google mobile apps included\n   - No additional mobile licensing fees\n   - Full feature access on mobile\n   - Consistent pricing model\n\n   **Office 365:**\n   - Outlook mobile app included\n   - Office mobile apps may require specific licenses\n   - Some advanced features need premium licenses\n   - Full feature parity across devices\n   - More complex licensing structure\n\n**Business Integration:**\n\n10. **Third-Party App Integration:**\n    \n    **Google Workspace:**\n    - Extensive Google Workspace Marketplace\n    - Easy API integration for developers\n    - Strong integration with web applications\n    - Google Apps Script for automation\n    - Marketplace apps often free or low-cost\n\n    **Office 365:**\n    - Microsoft AppSource for business apps\n    - Power Platform for custom solutions\n    - Deep integration with Microsoft ecosystem\n    - Azure Active Directory for enterprise apps\n    - More enterprise-focused integrations\n\n**Setup Recommendations by Business Type:**\n\n11. **Small to Medium Businesses:**\n    - Google Workspace: Easier setup, lower complexity\n    - Better for businesses new to cloud email\n    - Faster deployment and user adoption\n    - Lower IT overhead for management\n    - Good collaboration features out of the box\n\n12. **Enterprise Organizations:**\n    - Office 365: More advanced features and controls\n    - Better for complex organizational structures\n    - Superior compliance and security features\n    - Integration with existing Microsoft infrastructure\n    - More granular administrative controls\n\n**Migration Considerations:**\n\n13. **From Other Email Systems:**\n    \n    **To Google Workspace:**\n    - Google Workspace Migration tool\n    - Easier IMAP migrations\n    - Less complex user training required\n    - Faster switch-over process\n    - Good for businesses wanting simplicity\n\n    **To Office 365:**\n    - Microsoft migration tools and services\n    - Better for complex Exchange migrations\n    - More migration options available\n    - Phased migration capabilities\n    - Professional services readily available\n\n**Support and Training:**\n\n14. **User Training Requirements:**\n    \n    **Google Workspace:**\n    - Generally more intuitive for new users\n    - Familiar Gmail interface\n    - Less training required for basic functions\n    - Good online documentation and tutorials\n    - Community support readily available\n\n    **Office 365:**\n    - May require more initial training\n    - Familiar to existing Outlook users\n    - More features require more training\n    - Extensive Microsoft training resources\n    - Better enterprise support options\n\n**Decision Framework:**\n\n15. **Choose Google Workspace If:**\n    - Prioritizing ease of use and quick deployment\n    - Strong focus on collaboration and real-time editing\n    - Primarily web-based workflow\n    - Limited IT support staff\n    - Budget-conscious with simple needs\n\n16. **Choose Office 365 If:**\n    - Need advanced enterprise features\n    - Heavy Microsoft Office usage\n    - Complex compliance requirements\n    - Existing Microsoft infrastructure\n    - Dedicated IT support team\n\n**Hybrid Approach:**\nSome organizations use both platforms for different purposes:\n- Google Workspace for collaboration and project work\n- Office 365 for formal business communication\n- Integration tools to bridge both platforms\n- Department-specific platform choices\n\nNeed help choosing between Google Workspace and Office 365 for your business? AramisTech provides comprehensive email platform analysis, migration services, and ongoing support for both systems. Our experts will help you select and implement the optimal solution for your organization - call (305) 814-4461 for a consultation.	Detailed comparison of Google Workspace vs Office 365 mobile setup, features, security, and business integration to guide platform selection.	5	{"google workspace","office 365","email comparison","business email","platform selection","mobile setup"}	t	0	6	Google Workspace vs Office 365 Mobile Comparison | AramisTech Business Email	Compare Google Workspace and Office 365 mobile email platforms. Expert platform selection and migration services from AramisTech.	2025-06-27 02:58:09.966533	2025-06-27 02:58:09.966533
17	Setting Up Office 365 Exchange Email on Android	office-365-exchange-android-setup	Configure Office 365 Exchange email on your Android device for professional mobile communication:\n\n**Prerequisites:**\n- Office 365 email address and password\n- Stable internet connection (WiFi recommended for setup)\n- Latest Android OS version for best compatibility\n- Company Exchange server details if custom configuration needed\n\n**Method 1: Using Outlook Mobile App (Recommended):**\n\n1. **Download Microsoft Outlook:**\n   - Install from Google Play Store\n   - Official Microsoft app with full features\n   - Best integration with Office 365 services\n   - Supports multiple accounts\n\n2. **Initial Setup:**\n   - Open Outlook app\n   - Tap "Get Started"\n   - Enter your Office 365 email address\n   - Tap "Continue"\n   - Enter your password\n   - App automatically configures settings\n\n3. **Account Verification:**\n   - Complete any required authentication\n   - Allow permissions for notifications\n   - Choose what to sync (email, calendar, contacts)\n   - Set up notifications preferences\n\n**Method 2: Using Gmail App:**\n\n4. **Add Exchange Account to Gmail:**\n   - Open Gmail app\n   - Tap menu (three lines) > Settings\n   - Tap "Add account"\n   - Select "Exchange and Office 365"\n   - Enter your email address and password\n\n5. **Server Configuration:**\n   - Server: outlook.office365.com\n   - Port: 993 (IMAP) or 587 (SMTP)\n   - Security: SSL/TLS\n   - Authentication: OAuth2 (preferred) or Password\n\n**Method 3: Built-in Android Email App:**\n\n6. **Native Email App Setup:**\n   - Open Email or Mail app\n   - Tap "Add Account"\n   - Select "Exchange" or "Corporate"\n   - Enter email address and password\n   - Allow automatic configuration\n\n7. **Manual Configuration (if needed):**\n   - Server: outlook.office365.com\n   - Domain: Your company domain or leave blank\n   - Username: Full email address\n   - Password: Office 365 password\n   - Use secure connection: Yes\n\n**Calendar and Contacts Integration:**\n\n8. **Google Calendar Sync:**\n   - Add Office 365 calendar to Google Calendar\n   - Go to calendar.google.com\n   - Add "Other calendars" > "From URL"\n   - Use Office 365 calendar sharing link\n\n9. **Contacts Synchronization:**\n   - Office 365 contacts sync automatically with Outlook app\n   - For Gmail app: Import contacts from Office 365\n   - Use Google Contacts for unified contact management\n   - Set up Global Address List access\n\n**Advanced Configuration:**\n\n10. **Push Notifications Setup:**\n    - Configure real-time email notifications\n    - Set quiet hours for work-life balance\n    - Customize notification sounds per account\n    - Choose notification priority levels\n\n11. **Security Settings:**\n    - Enable app lock/PIN if available\n    - Configure remote wipe capabilities\n    - Set up two-factor authentication\n    - Follow company mobile device policies\n\n**Business Features Configuration:**\n\n12. **Meeting Management:**\n    - Accept/decline meeting invitations\n    - Set meeting reminders and alerts\n    - Access Teams meeting links\n    - Sync with other calendar apps\n\n13. **Email Organization:**\n    - Set up focused inbox\n    - Configure email rules and filters\n    - Organize with folders and categories\n    - Set up automatic replies/out of office\n\n**Troubleshooting Common Issues:**\n\n14. **Authentication Problems:**\n    - Clear app cache and data\n    - Remove and re-add account\n    - Check for app updates\n    - Verify password hasn't expired\n    - Use app-specific password if 2FA enabled\n\n15. **Sync Issues:**\n    - Check internet connectivity\n    - Verify server settings\n    - Restart email app\n    - Check account storage limits\n    - Contact IT for server status\n\n16. **Performance Optimization:**\n    - Limit sync period (last 1-3 months)\n    - Reduce attachment auto-download\n    - Clear email cache regularly\n    - Close unnecessary background apps\n\n**Security Best Practices:**\n\n17. **Mobile Device Security:**\n    - Use device lock screen protection\n    - Enable device encryption\n    - Install security updates promptly\n    - Avoid public WiFi for email access\n\n18. **Data Protection:**\n    - Regular backup of important emails\n    - Use secure email viewing\n    - Be cautious with email attachments\n    - Follow company data handling policies\n\n**Enterprise Features:**\n\n19. **Mobile Device Management (MDM):**\n    - Install Company Portal if required\n    - Accept enterprise policies\n    - Allow remote management capabilities\n    - Understand compliance requirements\n\n20. **Integration with Other Apps:**\n    - Microsoft Teams integration\n    - OneDrive file sharing\n    - SharePoint access\n    - Power BI mobile reports\n\n**Multi-Account Management:**\n- Add multiple Office 365 accounts\n- Switch between personal and business accounts\n- Separate notification settings per account\n- Manage different signature files\n\nNeed professional Office 365 mobile setup or enterprise mobility management? AramisTech provides comprehensive mobile email solutions and device management for businesses. Get expert configuration and ongoing support - call (305) 814-4461.	Comprehensive guide to setting up Office 365 Exchange email on Android devices with multiple setup methods and business features.	5	{"office 365",exchange,android,"email setup","mobile email","outlook app"}	t	1	3	Office 365 Exchange Email Setup on Android | AramisTech Mobile Solutions	Complete Android Office 365 Exchange email setup guide. Professional mobile email configuration and support from AramisTech.	2025-06-27 02:55:43.257578	2025-06-27 02:55:43.257578
16	Setting Up Office 365 Exchange Email on iPhone	office-365-exchange-iphone-setup	Configure your Office 365 Exchange email on iPhone for seamless business communication:\n\n**Before You Begin:**\n- Ensure you have your Office 365 email address and password\n- Connect to WiFi for faster setup\n- Have your company's Exchange server information if needed\n- Update iOS to latest version for best compatibility\n\n**Automatic Setup (Recommended):**\n\n1. **Add Exchange Account:**\n   - Open Settings > Mail > Accounts\n   - Tap "Add Account"\n   - Select "Microsoft Exchange"\n   - Enter your full Office 365 email address\n   - Tap "Next"\n\n2. **Enter Password:**\n   - Enter your Office 365 password\n   - Tap "Next"\n   - iPhone will automatically configure settings\n   - This works for most Office 365 accounts\n\n3. **Choose What to Sync:**\n   - Mail (recommended: ON)\n   - Contacts (recommended: ON)\n   - Calendars (recommended: ON)\n   - Reminders (optional)\n   - Notes (optional)\n   - Tap "Save"\n\n**Manual Setup (If Automatic Fails):**\n\n4. **Manual Configuration:**\n   - Select "Configure Manually" if automatic setup fails\n   - Enter these server settings:\n   - Server: outlook.office365.com\n   - Domain: Leave blank or enter your company domain\n   - Username: Your full email address\n   - Password: Your Office 365 password\n\n5. **Advanced Settings:**\n   - Use SSL: ON\n   - Authentication: Password\n   - Delete from server: Never (recommended)\n   - S/MIME: OFF (unless required by company)\n\n**Email App Configuration:**\n\n6. **Mail App Settings:**\n   - Open Mail app to verify setup\n   - Check that folders sync properly\n   - Test sending and receiving emails\n   - Configure push notifications if desired\n\n7. **Notification Settings:**\n   - Go to Settings > Notifications > Mail\n   - Choose your Exchange account\n   - Enable notifications for new mail\n   - Set preview and alert style preferences\n\n**Calendar and Contacts Setup:**\n\n8. **Calendar Integration:**\n   - Open Calendar app\n   - Verify Office 365 calendar appears\n   - Check meeting invitations sync\n   - Set default calendar if multiple accounts\n\n9. **Contacts Sync:**\n   - Open Contacts app\n   - Verify company contacts appear\n   - Check Global Address List access\n   - Test contact search functionality\n\n**Security Features:**\n\n10. **Two-Factor Authentication:**\n    - If company requires 2FA, you may need app password\n    - Use Microsoft Authenticator app\n    - Follow company security policies\n    - Contact IT if authentication issues occur\n\n11. **Mobile Device Management (MDM):**\n    - Company may require device enrollment\n    - Install Company Portal app if requested\n    - Allow policy enforcement for security\n    - Understand remote wipe capabilities\n\n**Troubleshooting Common Issues:**\n\n12. **Authentication Problems:**\n    - Verify correct email and password\n    - Clear saved passwords and re-enter\n    - Check if account is locked\n    - Try using app-specific password\n\n13. **Sync Issues:**\n    - Check internet connection\n    - Restart Mail app\n    - Remove and re-add account\n    - Check server status with IT department\n\n14. **Missing Features:**\n    - Update iOS to latest version\n    - Check company Exchange settings\n    - Verify account permissions\n    - Contact administrator for access issues\n\n**Advanced Configuration:**\n\n15. **Push vs Fetch Settings:**\n    - Go to Settings > Mail > Accounts > Fetch New Data\n    - Set Exchange to "Push" for instant email\n    - Adjust fetch schedule for battery life\n    - Use "Automatically" for smart updating\n\n16. **Email Signature:**\n    - Go to Settings > Mail > Signature\n    - Set per-account signatures if needed\n    - Include professional contact information\n    - Keep mobile-friendly and concise\n\n**Business Features:**\n\n17. **Meeting Management:**\n    - Accept/decline meetings from email\n    - Set meeting reminders\n    - Access conference call information\n    - Sync with other calendar apps if needed\n\n18. **Out of Office Setup:**\n    - Use Outlook mobile app for full features\n    - Set automatic replies through web interface\n    - Configure different messages for internal/external\n    - Set specific date ranges\n\nNeed help with Office 365 setup or mobile device management? AramisTech provides comprehensive email configuration and business mobility solutions. Contact us at (305) 814-4461 for professional setup and support.	Step-by-step guide to setting up Office 365 Exchange email on iPhone with troubleshooting tips and business features.	5	{"office 365",exchange,iphone,"email setup","mobile email",ios}	t	1	2	Office 365 Exchange Email Setup on iPhone | AramisTech Mobile Solutions	Complete guide to setting up Office 365 Exchange email on iPhone. Professional mobile email configuration from AramisTech IT experts.	2025-06-27 02:55:43.257578	2025-06-27 02:55:43.257578
12	Installing Microsoft Office and Business Software	installing-microsoft-office-business-software	Proper software installation ensures optimal performance and security. Here's your complete installation guide:\n\n**Microsoft Office Installation:**\n\n1. **Office 365/Microsoft 365:**\n   - Sign in to office.com with your account\n   - Click "Install Office" button\n   - Download and run the installer\n   - Sign in when prompted during installation\n   - Activation happens automatically with internet connection\n\n2. **Office 2021 (One-time purchase):**\n   - Enter product key at office.com/setup\n   - Download installer from Microsoft\n   - Run setup and enter product key when prompted\n   - Complete installation and activate\n\n**Pre-Installation Checklist:**\n- Uninstall previous Office versions\n- Ensure Windows is up to date\n- Close all running programs\n- Disable antivirus temporarily during install\n- Have product key or account credentials ready\n\n**Common Installation Issues:**\n\n3. **Installation Failures:**\n   - Run Windows Update before installing\n   - Use Microsoft Support and Recovery Assistant\n   - Clear temporary files and restart\n   - Install as administrator\n   - Check available disk space (4GB+ required)\n\n4. **Activation Problems:**\n   - Verify internet connection\n   - Check if Office is already activated elsewhere\n   - Use correct Microsoft account\n   - Contact Microsoft support for activation issues\n\n**Business Software Best Practices:**\n\n5. **Deployment Planning:**\n   - Create software inventory\n   - Test installations on pilot computers\n   - Document license requirements\n   - Plan rollout schedule\n   - Prepare user training materials\n\n6. **License Management:**\n   - Track software licenses and compliance\n   - Use volume licensing for multiple computers\n   - Monitor license usage and renewals\n   - Maintain software asset inventory\n\n**Essential Business Software:**\n\n7. **Productivity Suite:**\n   - Microsoft Office or Google Workspace\n   - PDF reader/editor (Adobe Acrobat)\n   - Communication tools (Teams, Slack)\n   - File compression utilities\n\n8. **Security Software:**\n   - Business-grade antivirus\n   - Firewall software\n   - VPN client software\n   - Backup and recovery tools\n\n**Installation Security:**\n\n9. **Safe Installation Practices:**\n   - Download only from official sources\n   - Verify digital signatures\n   - Scan installers with antivirus\n   - Create system restore point before major installations\n\n10. **Post-Installation Steps:**\n    - Configure automatic updates\n    - Set up user accounts and permissions\n    - Configure backup of settings\n    - Train users on new software features\n\n**Troubleshooting Tips:**\n- Use compatibility mode for older software\n- Run installations as administrator\n- Temporarily disable security software\n- Check system requirements before installing\n- Use vendor-specific removal tools for clean uninstalls\n\nAramisTech provides professional software installation, configuration, and deployment services for businesses. Ensure proper software setup and licensing compliance - call (305) 814-4461.	Professional guide to installing Microsoft Office and business software with troubleshooting tips and best practices.	5	{"microsoft office","software installation","business software",licensing,deployment}	t	1	1	Microsoft Office Installation Guide | AramisTech Business Software	Complete Microsoft Office and business software installation guide with troubleshooting and deployment tips from AramisTech.	2025-06-27 02:48:04.331954	2025-06-27 02:48:04.331954
13	Recovering Deleted Files and Lost Data	recovering-deleted-files-lost-data	Accidental file deletion happens to everyone. Here's how to recover your important data:\n\n**Immediate Actions (CRITICAL):**\n\n1. **Stop Using the Computer:**\n   - Don't save new files to the affected drive\n   - Don't install recovery software on the same drive\n   - Shut down non-essential programs\n   - Time is critical - act fast\n\n2. **Check Common Locations:**\n   - Recycle Bin/Trash (most obvious place)\n   - Recent Documents in applications\n   - Cloud sync folders (OneDrive, Google Drive)\n   - Email attachments if files were shared\n\n**Built-in Recovery Options:**\n\n3. **Windows File Recovery:**\n   - Use File History if enabled\n   - Check Previous Versions in file properties\n   - System Restore for system files\n   - Windows File Recovery tool (command line)\n\n4. **Cloud Service Recovery:**\n   - OneDrive: Check deleted files folder\n   - Google Drive: Go to Trash folder\n   - Dropbox: Check deleted files section\n   - Most services keep deleted files 30-90 days\n\n**Recovery Software Options:**\n\n5. **Free Recovery Tools:**\n   - Recuva (by Piriform)\n   - PhotoRec (for photos and documents)\n   - TestDisk (for partition recovery)\n   - Windows File Recovery (Microsoft official)\n\n6. **Professional Recovery Software:**\n   - R-Studio (comprehensive recovery)\n   - GetDataBack (NTFS/FAT recovery)\n   - Disk Drill (user-friendly interface)\n   - Stellar Data Recovery\n\n**Recovery Process Steps:**\n\n7. **Using Recovery Software:**\n   - Install on different drive than affected one\n   - Run deep scan on affected drive\n   - Preview recoverable files before recovery\n   - Save recovered files to different location\n   - Don't overwrite original location\n\n**Advanced Recovery Scenarios:**\n\n8. **Formatted Drive Recovery:**\n   - Stop using drive immediately\n   - Use professional recovery software\n   - Perform sector-by-sector scanning\n   - May require professional services\n\n9. **Corrupted File Recovery:**\n   - Try opening with different programs\n   - Use file repair utilities\n   - Check for backup versions\n   - Professional data recovery if critical\n\n**Prevention Strategies:**\n\n10. **Backup Best Practices:**\n    - Automated daily backups\n    - Multiple backup locations\n    - Test restore procedures regularly\n    - Version control for important documents\n\n11. **File Management:**\n    - Organize files in logical folders\n    - Use descriptive file names\n    - Regular file cleanup and archiving\n    - Don't store everything on desktop\n\n**When to Call Professionals:**\n\n- Physical hard drive damage\n- Multiple drive failures\n- RAID array corruption\n- Critical business data loss\n- Recovery attempts failed\n\n**Data Recovery Success Rates:**\n- Accidental deletion: 95%+ success\n- Formatted drives: 80-90% success\n- Physical damage: 60-80% success\n- Severe corruption: 40-70% success\n\nAramisTech provides professional data recovery services with state-of-the-art equipment and clean room facilities. We recover data other companies can't - call (305) 814-4461 for emergency data recovery.	Complete guide to recovering deleted files and lost data using built-in tools, recovery software, and professional services.	6	{"data recovery","deleted files","file recovery",backup,"lost data"}	t	1	1	Deleted File Recovery Guide | AramisTech Data Recovery Services	Professional guide to recovering deleted files and lost data. Emergency data recovery services available from AramisTech experts.	2025-06-27 02:48:04.331954	2025-06-27 02:48:04.331954
6	Setting Up a Secure Home Office Network	secure-home-office-network	With remote work becoming standard, securing your home office network is essential:\n\n**Router Security Basics:**\n\n1. **Change Default Passwords:**\n   - Access router admin panel (usually 192.168.1.1)\n   - Change default admin username/password\n   - Use strong, unique passwords\n\n2. **Update Router Firmware:**\n   - Check manufacturer website for updates\n   - Enable automatic updates if available\n   - Firmware updates fix security vulnerabilities\n\n3. **Network Encryption:**\n   - Use WPA3 encryption (or WPA2 minimum)\n   - Avoid WEP encryption (outdated and insecure)\n   - Create strong WiFi network password\n\n**Advanced Security Measures:**\n\n4. **Guest Network Setup:**\n   - Create separate network for visitors\n   - Isolate guest devices from main network\n   - Limit guest network access and bandwidth\n\n5. **Firewall Configuration:**\n   - Enable router firewall\n   - Configure port forwarding carefully\n   - Block unnecessary incoming connections\n\n6. **VPN for Remote Access:**\n   - Set up business VPN connection\n   - Use VPN for accessing company resources\n   - Consider router-level VPN for all devices\n\n**Device Security:**\n\n7. **IoT Device Management:**\n   - Change default passwords on smart devices\n   - Regularly update device firmware\n   - Consider separate network for IoT devices\n\n8. **Network Monitoring:**\n   - Review connected devices regularly\n   - Monitor for unknown devices\n   - Check network activity logs\n\n**Business-Grade Solutions:**\n- Managed network services\n- Enterprise-grade security appliances\n- 24/7 network monitoring\n- Professional network assessment\n\nAramisTech specializes in secure network design for home offices and small businesses. Get professional network security assessment and setup - call (305) 814-4461.	Complete guide to securing your home office network with professional-grade security measures and best practices.	3	{"home office","network security","router setup",VPN,"remote work",firewall}	t	1	2	Secure Home Office Network Setup Guide | AramisTech	Professional guide to securing home office networks. Learn router security, VPN setup, and network protection from AramisTech experts.	2025-06-27 02:46:24.240966	2025-06-27 02:46:24.240966
14	Setting Up Remote Desktop and Remote Access	remote-desktop-remote-access-setup	Remote access enables secure work from anywhere. Here's how to set up and use remote desktop solutions:\n\n**Windows Built-in Remote Desktop:**\n\n1. **Enable Remote Desktop (Host Computer):**\n   - Go to Settings > System > About\n   - Click "Advanced system settings"\n   - Check "Enable Remote Desktop"\n   - Configure user accounts for remote access\n   - Note computer name and IP address\n\n2. **Connect from Another Computer:**\n   - Open Remote Desktop Connection\n   - Enter computer name or IP address\n   - Provide username and password\n   - Save connection for future use\n\n**Network Configuration:**\n\n3. **Router Setup for External Access:**\n   - Forward port 3389 to host computer\n   - Use strong passwords and limited users\n   - Consider changing default port for security\n   - Enable Network Level Authentication\n\n4. **Security Considerations:**\n   - Use VPN instead of direct port forwarding\n   - Enable two-factor authentication when available\n   - Regularly update remote access software\n   - Monitor remote access logs\n\n**Third-Party Remote Access Solutions:**\n\n5. **TeamViewer:**\n   - Easy setup with ID and password system\n   - Works through firewalls automatically\n   - Cross-platform support (Windows, Mac, mobile)\n   - Free for personal use, paid for commercial\n\n6. **Chrome Remote Desktop:**\n   - Browser-based remote access\n   - Uses Google account authentication\n   - Simple setup through Chrome browser\n   - Good for basic remote support\n\n7. **Professional Solutions:**\n   - LogMeIn Pro (business-grade features)\n   - ConnectWise Control (IT professional tool)\n   - Splashtop Business (high-performance remote access)\n   - RemotePC (cost-effective business solution)\n\n**Mobile Remote Access:**\n\n8. **Remote Desktop Apps:**\n   - Microsoft Remote Desktop (iOS/Android)\n   - TeamViewer mobile apps\n   - Chrome Remote Desktop mobile\n   - VNC Viewer apps\n\n**Business Remote Access Setup:**\n\n9. **VPN Configuration:**\n   - Set up business VPN server\n   - Configure client connections\n   - Use strong encryption protocols\n   - Implement access policies and logging\n\n10. **Remote Access Policies:**\n    - Define who can access what systems\n    - Require strong authentication\n    - Monitor and log all remote sessions\n    - Regular security audits and updates\n\n**Troubleshooting Common Issues:**\n\n11. **Connection Problems:**\n    - Check firewall settings on both computers\n    - Verify network connectivity\n    - Confirm correct IP address/computer name\n    - Test local network connection first\n\n12. **Performance Issues:**\n    - Adjust display settings for better speed\n    - Close unnecessary programs on host computer\n    - Use wired internet connection when possible\n    - Consider bandwidth limitations\n\n**Security Best Practices:**\n\n13. **Access Control:**\n    - Use unique, strong passwords\n    - Enable account lockout policies\n    - Regularly review user access rights\n    - Implement session timeout settings\n\n14. **Monitoring and Logging:**\n    - Track remote access sessions\n    - Review connection logs regularly\n    - Set up alerts for suspicious activity\n    - Maintain audit trails for compliance\n\nAramisTech provides professional remote access setup, VPN configuration, and secure remote work solutions for businesses. Get expert remote access setup and support - call (305) 814-4461.	Comprehensive guide to setting up remote desktop and remote access solutions for secure work from anywhere.	3	{"remote desktop","remote access",VPN,"remote work",TeamViewer,"network security"}	t	1	3	Remote Desktop Setup Guide | AramisTech Remote Access Solutions	Professional remote desktop and remote access setup guide. Secure remote work solutions from AramisTech IT experts.	2025-06-27 02:48:04.331954	2025-06-27 02:48:04.331954
\.


--
-- Data for Name: knowledge_base_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.knowledge_base_categories (id, name, slug, description, order_index, is_visible, created_at, updated_at) FROM stdin;
1	Troubleshooting	troubleshooting	Common IT issues and their solutions	1	t	2025-06-27 02:40:08.101363	2025-06-27 02:40:08.101363
2	Cybersecurity	cybersecurity	Security best practices and protection tips	2	t	2025-06-27 02:40:08.101363	2025-06-27 02:40:08.101363
3	Network & Internet	network-internet	Network connectivity and internet issues	3	t	2025-06-27 02:40:08.101363	2025-06-27 02:40:08.101363
4	Hardware Issues	hardware-issues	Computer hardware problems and component troubleshooting	4	t	2025-06-27 02:46:32.431177	2025-06-27 02:46:32.431177
5	Software Installation	software-installation	Installing and configuring business software applications	5	t	2025-06-27 02:46:32.431177	2025-06-27 02:46:32.431177
6	Data Recovery	data-recovery	Recovering lost files and restoring corrupted data	6	t	2025-06-27 02:46:32.431177	2025-06-27 02:46:32.431177
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.media_files (id, file_name, original_name, mime_type, file_size, file_path, url, alt_text, caption, uploaded_at, updated_at, s3_url, is_backed_up, description, tags, folder, image_width, image_height, is_public, download_count, uploaded_by) FROM stdin;
1	file-1751143210294-25594172.png	CircleLogoDesign.png	image/png	203779	/home/runner/workspace/uploads/file-1751143210294-25594172.png	/uploads/file-1751143210294-25594172.png			2025-06-28 20:40:10.318774	2025-06-28 20:40:10.318774	\N	f	\N	\N		\N	\N	t	0	\N
2	file-1751144015075-580876041.jpg	Google Chrome--06-24-2025 2.jpg	image/jpeg	287331	/home/runner/workspace/uploads/file-1751144015075-580876041.jpg	/uploads/file-1751144015075-580876041.jpg			2025-06-28 20:53:35.091935	2025-06-28 20:53:35.091935	\N	f	\N	\N		\N	\N	t	0	\N
3	scanned-NewLOGOimageonly-1751144484243-632643992.png	NewLOGOimageonly.png (from aramistech.com)	image/png	20240	/home/runner/workspace/uploads/scanned-NewLOGOimageonly-1751144484243-632643992.png	/uploads/scanned-NewLOGOimageonly-1751144484243-632643992.png			2025-06-28 21:01:24.265597	2025-06-28 21:01:24.265597	\N	f	\N	\N		\N	\N	t	0	\N
4	scanned-AramistechLogoNoLine-1751144484352-91529373.png	AramistechLogoNoLine.png (from aramistech.com)	image/png	47684	/home/runner/workspace/uploads/scanned-AramistechLogoNoLine-1751144484352-91529373.png	/uploads/scanned-AramistechLogoNoLine-1751144484352-91529373.png			2025-06-28 21:01:24.363746	2025-06-28 21:01:24.363746	\N	f	\N	\N		\N	\N	t	0	\N
5	scanned-minimal-slide-1-1751144484497-160560921.jpg	minimal-slide-1.jpg (from aramistech.com)	image/jpeg	155859	/home/runner/workspace/uploads/scanned-minimal-slide-1-1751144484497-160560921.jpg	/uploads/scanned-minimal-slide-1-1751144484497-160560921.jpg			2025-06-28 21:01:24.508743	2025-06-28 21:01:24.508743	\N	f	\N	\N		\N	\N	t	0	\N
6	scanned-minimal-slide-2-1751144484585-101621287.jpg	minimal-slide-2.jpg (from aramistech.com)	image/jpeg	207975	/home/runner/workspace/uploads/scanned-minimal-slide-2-1751144484585-101621287.jpg	/uploads/scanned-minimal-slide-2-1751144484585-101621287.jpg			2025-06-28 21:01:24.598733	2025-06-28 21:01:24.598733	\N	f	\N	\N		\N	\N	t	0	\N
7	scanned-about-us-1751144484678-235136516.jpg	about-us.jpg (from aramistech.com)	image/jpeg	65050	/home/runner/workspace/uploads/scanned-about-us-1751144484678-235136516.jpg	/uploads/scanned-about-us-1751144484678-235136516.jpg			2025-06-28 21:01:24.689617	2025-06-28 21:01:24.689617	\N	f	\N	\N		\N	\N	t	0	\N
8	scanned-Workstation-1-1751144484826-287683181.png	Workstation-1.png (from aramistech.com)	image/png	708956	/home/runner/workspace/uploads/scanned-Workstation-1-1751144484826-287683181.png	/uploads/scanned-Workstation-1-1751144484826-287683181.png			2025-06-28 21:01:24.837866	2025-06-28 21:01:24.837866	\N	f	\N	\N		\N	\N	t	0	\N
9	scanned-File-Server-1-1751144484919-299307373.png	File-Server-1.png (from aramistech.com)	image/png	326345	/home/runner/workspace/uploads/scanned-File-Server-1-1751144484919-299307373.png	/uploads/scanned-File-Server-1-1751144484919-299307373.png			2025-06-28 21:01:25.02908	2025-06-28 21:01:25.02908	\N	f	\N	\N		\N	\N	t	0	\N
10	scanned-Active-Directory-Server-1-1751144485110-20073772.png	Active-Directory-Server-1.png (from aramistech.com)	image/png	826263	/home/runner/workspace/uploads/scanned-Active-Directory-Server-1-1751144485110-20073772.png	/uploads/scanned-Active-Directory-Server-1-1751144485110-20073772.png			2025-06-28 21:01:25.12929	2025-06-28 21:01:25.12929	\N	f	\N	\N		\N	\N	t	0	\N
11	scanned-Exchange-Google-Workspace-1-1751144485209-479015732.png	Exchange-Google-Workspace-1.png (from aramistech.com)	image/png	754225	/home/runner/workspace/uploads/scanned-Exchange-Google-Workspace-1-1751144485209-479015732.png	/uploads/scanned-Exchange-Google-Workspace-1-1751144485209-479015732.png			2025-06-28 21:01:25.222028	2025-06-28 21:01:25.222028	\N	f	\N	\N		\N	\N	t	0	\N
12	scanned-Synology-1-1751144485306-572265378.png	Synology-1.png (from aramistech.com)	image/png	707973	/home/runner/workspace/uploads/scanned-Synology-1-1751144485306-572265378.png	/uploads/scanned-Synology-1-1751144485306-572265378.png			2025-06-28 21:01:25.319449	2025-06-28 21:01:25.319449	\N	f	\N	\N		\N	\N	t	0	\N
13	scanned-Hourly-IT-Support-1-1751144485395-147304750.png	Hourly-IT-Support-1.png (from aramistech.com)	image/png	386650	/home/runner/workspace/uploads/scanned-Hourly-IT-Support-1-1751144485395-147304750.png	/uploads/scanned-Hourly-IT-Support-1-1751144485395-147304750.png			2025-06-28 21:01:25.409959	2025-06-28 21:01:25.409959	\N	f	\N	\N		\N	\N	t	0	\N
14	scanned-2-1751144485496-944056901.png	2.png (from aramistech.com)	image/png	1509885	/home/runner/workspace/uploads/scanned-2-1751144485496-944056901.png	/uploads/scanned-2-1751144485496-944056901.png			2025-06-28 21:01:25.509283	2025-06-28 21:01:25.509283	\N	f	\N	\N		\N	\N	t	0	\N
17	scanned-GabyPic-370x371-1-1751144485778-886806853.png	GabyPic-370x371-1.png (from aramistech.com)	image/png	188154	/home/runner/workspace/uploads/scanned-GabyPic-370x371-1-1751144485778-886806853.png	/uploads/scanned-GabyPic-370x371-1-1751144485778-886806853.png			2025-06-28 21:01:25.791031	2025-06-28 21:01:25.791031	\N	f	\N	\N		\N	\N	t	0	\N
18	file-1751146074831-984450861.jpg	bluescreenerror.jpg	image/jpeg	103287	/home/runner/workspace/uploads/file-1751146074831-984450861.jpg	/uploads/file-1751146074831-984450861.jpg			2025-06-28 21:27:54.848625	2025-06-28 21:27:54.848625	\N	f	\N	\N		\N	\N	t	0	\N
20	file-1751146683903-227881566.png	gabynewprofile-pic.png	image/png	1028345	/home/runner/workspace/uploads/file-1751146683903-227881566.png	/uploads/file-1751146683903-227881566.png			2025-06-28 21:38:05.38222	2025-06-28 21:38:05.38222	\N	f	\N	\N		\N	\N	t	0	\N
22	file-1751160648845-917430597.jpg	about-us.jpg	image/jpeg	65050	/home/runner/workspace/uploads/file-1751160648845-917430597.jpg	/uploads/file-1751160648845-917430597.jpg			2025-06-29 01:30:48.873564	2025-06-29 01:30:48.873564	\N	f	\N	\N		\N	\N	t	0	\N
23	file-1751160648797-79303359.png	Cyber-Security.png	image/png	180067	/home/runner/workspace/uploads/file-1751160648797-79303359.png	/uploads/file-1751160648797-79303359.png			2025-06-29 01:30:48.954731	2025-06-29 01:30:48.954731	\N	f	\N	\N		\N	\N	t	0	\N
24	file-1751160648799-354761853.png	Home-1.png	image/png	195173	/home/runner/workspace/uploads/file-1751160648799-354761853.png	/uploads/file-1751160648799-354761853.png			2025-06-29 01:30:48.989374	2025-06-29 01:30:48.989374	\N	f	\N	\N		\N	\N	t	0	\N
25	file-1751161129176-889932672.png	photo-1551434678.png	image/png	622052	/home/runner/workspace/uploads/file-1751161129176-889932672.png	/uploads/file-1751161129176-889932672.png			2025-06-29 01:38:49.196148	2025-06-29 01:38:49.196148	\N	f	\N	\N		\N	\N	t	0	\N
27	file-1751163279534-988454758.png	photo-1506905925346.png	image/png	334276	/home/runner/workspace/uploads/file-1751163279534-988454758.png	/uploads/file-1751163279534-988454758.png			2025-06-29 02:14:39.889065	2025-06-29 02:14:39.889065	\N	f	\N	\N		\N	\N	t	0	\N
28	file-1751166234438-973947090.png	OurLogo-NameOnly.png	image/png	31290	/home/runner/workspace/uploads/file-1751166234438-973947090.png	/uploads/file-1751166234438-973947090.png			2025-06-29 03:03:54.462467	2025-06-29 03:03:54.462467	\N	f	\N	\N		\N	\N	t	0	\N
29	file-1751166261053-924273438.png	AramisTechFooterLogo.png	image/png	14196	/home/runner/workspace/uploads/file-1751166261053-924273438.png	/uploads/file-1751166261053-924273438.png			2025-06-29 03:04:21.06932	2025-06-29 03:04:21.06932	\N	f	\N	\N		\N	\N	t	0	\N
30	file-1751166267146-194290655.png	AramistechLogoNoLine.png	image/png	47684	/home/runner/workspace/uploads/file-1751166267146-194290655.png	/uploads/file-1751166267146-194290655.png			2025-06-29 03:04:27.161934	2025-06-29 03:04:27.161934	\N	f	\N	\N		\N	\N	t	0	\N
31	file-1751167681487-751357363.png	windows10-bg.png	image/png	2402310	/home/runner/workspace/uploads/file-1751167681487-751357363.png	/uploads/file-1751167681487-751357363.png	Windows 10 Background Image		2025-06-29 03:28:01.515088	2025-06-29 03:28:01.515088	\N	f	\N	\N		\N	\N	t	0	\N
32	file-1751167960906-65136190.jpg	img0_3840x2160.jpg	image/jpeg	827705	/home/runner/workspace/uploads/file-1751167960906-65136190.jpg	/uploads/file-1751167960906-65136190.jpg			2025-06-29 03:32:41.756484	2025-06-29 03:32:41.756484	\N	f	\N	\N		\N	\N	t	0	\N
33	file-1751168325169-643966711.jpg	win10.jpg	image/jpeg	229263	/home/runner/workspace/uploads/file-1751168325169-643966711.jpg	/uploads/file-1751168325169-643966711.jpg			2025-06-29 03:38:45.527173	2025-06-29 03:38:45.527173	\N	f	\N	\N		\N	\N	t	0	\N
34	file-1751168753995-459053011.png	videocover.png	image/png	1969471	/home/runner/workspace/uploads/file-1751168753995-459053011.png	/uploads/file-1751168753995-459053011.png			2025-06-29 03:45:55.498081	2025-06-29 03:45:55.498081	\N	f	\N	\N		\N	\N	t	0	\N
36	google-review-qr-code.png	Google Review QR Code	image/png	1024	uploads/google-review-qr-code.png	/uploads/google-review-qr-code.png	Google Review QR Code for AramisTech	QR Code for Google Reviews	2025-07-02 13:54:30.47059	2025-07-02 13:54:30.47059	\N	f	\N	\N		\N	\N	t	0	\N
38	file-1751766988885-504626106.png	techguys2.png	image/png	2713097	/home/runner/workspace/uploads/file-1751766988885-504626106.png	/uploads/file-1751766988885-504626106.png			2025-07-06 01:56:29.956321	2025-07-06 01:56:29.956321	\N	f	\N	\N		\N	\N	t	0	\N
42	file-1752986714957-593209441.png	logoforsignatures.png	image/png	10247	/home/runner/workspace/uploads/file-1752986714957-593209441.png	/api/media/42/file			2025-07-20 04:45:14.97402	2025-07-20 04:45:14.97402	\N	f	\N	\N		\N	\N	t	0	\N
15	scanned-profile-pic-2-1751144485600-277038523.png	profile-pic-2.png (from aramistech.com)	image/png	1237990	/home/runner/workspace/uploads/scanned-profile-pic-2-1751144485600-277038523.png	/api/media/15/file			2025-06-28 21:01:25.613351	2025-06-28 21:01:25.613351	\N	f	\N	\N		\N	\N	t	0	\N
16	scanned-Grayprofile-pic2-600x600-1-1751144485689-666837587.png	Grayprofile-pic2-600x600-1.png (from aramistech.com)	image/png	244177	/home/runner/workspace/uploads/scanned-Grayprofile-pic2-600x600-1-1751144485689-666837587.png	/api/media/16/file			2025-06-28 21:01:25.702239	2025-06-28 21:01:25.702239	\N	f	\N	\N		\N	\N	t	0	\N
21	file-1751148533252-457714447.png	gabynewprofile-pic2.png	image/png	942097	/home/runner/workspace/uploads/file-1751148533252-457714447.png	/api/media/21/file			2025-06-28 22:08:53.565284	2025-06-28 22:08:53.565284	\N	f	\N	\N		\N	\N	t	0	\N
26	file-1751161141939-598987170.png	photo-1497366216548.png	image/png	341298	/home/runner/workspace/uploads/file-1751161141939-598987170.png	/api/media/26/file			2025-06-29 01:39:01.955242	2025-06-29 01:39:01.955242	\N	f	\N	\N		\N	\N	t	0	\N
56	file-1753163903617-756616517.png	Aramis2025.png	image/png	157124	/home/runner/workspace/uploads/file-1753163903617-756616517.png	/api/media/56/file			2025-07-22 05:58:23.635665	2025-07-22 05:58:23.902	https://s3.us-east-1.amazonaws.com/MILL33122/aramistechwebsiteimages/file-1753163903617-756616517.png	t	\N	\N		\N	\N	t	0	\N
57	file-1753163907781-383057344.png	AramisM2025.png	image/png	131758	/home/runner/workspace/uploads/file-1753163907781-383057344.png	/api/media/57/file			2025-07-22 05:58:27.827148	2025-07-22 05:58:27.963	https://s3.us-east-1.amazonaws.com/MILL33122/aramistechwebsiteimages/file-1753163907781-383057344.png	t	\N	\N		\N	\N	t	0	\N
58	file-1753163912412-355362174.png	Gabriel2025.png	image/png	141761	/home/runner/workspace/uploads/file-1753163912412-355362174.png	/api/media/58/file			2025-07-22 05:58:32.528299	2025-07-22 05:58:32.726	https://s3.us-east-1.amazonaws.com/MILL33122/aramistechwebsiteimages/file-1753163912412-355362174.png	t	\N	\N		\N	\N	t	0	\N
59	file-1753280083999-192379128.png	Gabriel2025-2.png	image/png	172813	/home/runner/workspace/uploads/file-1753280083999-192379128.png	/api/media/59/file			2025-07-23 14:14:44.02417	2025-07-23 14:14:44.398	https://s3.us-east-1.amazonaws.com/MILL33122/aramistechwebsiteimages/file-1753280083999-192379128.png	t	\N	\N		\N	\N	t	0	\N
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.menu_items (id, label, href, parent_id, order_index, is_visible, created_at, updated_at) FROM stdin;
20	RustDesk Quicksupport (Older INTEL Mac Only)	/api/download/rustdesk/macos-intel	12	8	t	2025-06-26 21:16:22.367283	2025-06-26 21:16:22.352
17	Microsoft QUICK ASSIST (Windows Only)	/api/download/microsoft-quick-assist	12	4	t	2025-06-26 21:14:59.195793	2025-06-26 21:14:59.181
18	RustDesk Quicksupport (Windows Only)	https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-x86_64.exe	12	5	t	2025-06-26 21:15:25.925894	2025-06-27 00:13:15.787
19	RustDesk Quicksupport (MacOS Only)	https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-aarch64.dmg	12	7	t	2025-06-26 21:15:55.615251	2025-06-27 00:14:07.971
9	Home	/	\N	0	t	2025-06-26 21:13:04.778387	2025-06-27 02:51:08.776
11	About	#about	\N	1	t	2025-06-26 21:13:04.778387	2025-06-27 02:51:08.8
21	AI Development	/ai-development	\N	2	t	2025-06-26 21:50:36.695467	2025-06-27 02:51:08.823
12	Support		\N	4	t	2025-06-26 21:13:04.778387	2025-06-27 02:51:08.869
13	Contact Us	#contact	\N	6	t	2025-06-26 21:13:04.778387	2025-06-27 02:51:08.919
22	Knowledge Base	/knowledge-base	12	2	t	2025-06-27 02:40:45.79005	2025-06-27 02:52:23.297
15	Windows 10 Upgrade	/windows10-upgrade	12	3	t	2025-06-26 21:13:15.928452	2025-06-27 02:52:56.988
16	IP Lookup	/ip-lookup	12	4	t	2025-06-26 21:13:15.928452	2025-06-27 02:53:04.5
23	Service Calculator	/service-calculator	12	3	t	2025-06-28 20:22:59.042457	2025-06-28 20:22:59.042457
10	Services	/services	\N	3	t	2025-06-26 21:13:04.778387	2025-06-30 00:56:54.596
14	Customer Portal	https://billing.aramistech.com/index.php?rp=/login	12	1	t	2025-06-26 21:13:15.928452	2025-07-06 01:38:49.239
\.


--
-- Data for Name: page_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.page_content (id, page, section, title, content, image_url, image_alt, display_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pricing_calculations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pricing_calculations (id, session_id, customer_name, customer_email, customer_phone, company_name, selected_services, total_estimate, estimate_breakdown, urgency_level, project_description, preferred_contact_method, is_converted, conversion_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quick_quotes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quick_quotes (id, name, email, phone, created_at) FROM stdin;
1	aramis	aramis@aramistech.com	3054282238	2025-06-27 04:15:26.7911
2	Figueroa	aramistech@gmail.com	3054282238	2025-06-27 15:34:04.396315
3	Test Customer	test@example.com	(555) 123-4567	2025-06-27 15:36:02.453112
4	Test AramisTech	test@aramistech.com	(305) 814-4461	2025-06-27 17:07:28.353113
5	Email Test Customer	customer@example.com	(561) 419-7800	2025-06-27 17:07:51.87881
6	AramisTech Test	test@aramistech.com	(305) 814-4461	2025-06-27 17:17:03.125514
7	Email Test 2	customer@aramistech.com	(561) 419-7800	2025-06-27 17:17:15.593196
8	Policy Test Customer	test@example.com	(305) 814-4461	2025-06-27 17:19:52.660691
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, customer_name, rating, review_text, business_name, location, date_posted, is_visible, source) FROM stdin;
5	RPS Distributors	5	We've been working with AramisTech for over 10 years. The service we have received has been outstanding and we never had any issues. The team is always available and ready to solve any situation that may arise. They are very understanding and resolve any type of problem very fast. We highly recommend their services and look forward to keep working with them in the years to come!	AramisTech	South Florida	2025-06-26 05:13:31.023585	t	manual
6	Georges Interior	5	We have been working with Aramis Tech for years now they are very efficient and always available when you need them . I highly recommend them for your IT needs	AramisTech	South Florida	2025-06-26 05:13:51.69061	t	manual
7	Yablen Valiente Law	5	Aramis has been invaluable for our law office's technical support for the past twelve years. Aramis is always very responsive and has kept our office up and running. It is without hesitation, that i recommend Aramis to anyone looking for a knowledgeable and reliable IT person for their office. Amir A Office Manager	AramisTech	South Florida	2025-06-26 05:14:14.988533	t	manual
8	GMAIR	5	We have been working with Aramistech for more than 10 years and I can say it is a responsible, reliable and dependable company. Any problem we have they fix it quickly and wisely. The knowledge they have is incredible and they always work in a good mood, no matter how many questions you have, they will answer them without problem. It is a company in which we place all our trust. Thank you, Aramis, for all your support to our company. We hope to continue with you for many more years.	AramisTech	South Florida	2025-06-26 05:14:33.772357	t	manual
9	Ibarra Land Surveyors	5	It has been a true privilege for our company to collaborate with Aramis and his team at AramistTech for more than 15 years. As our IT specialist, he has consistently made the resolution of any technical issues within our Surveying Firm seamless and pleasant. From constructing multiple servers from the ground up to providing weekly maintenance for our extensive network of over 30 computers, his expertise has been invaluable. He is always ready to address our inquiries and consistently exceeds our expectations to ensure our satisfaction with the services provided. We wholeheartedly recommend him to anyone in search of an exceptional IT firm.	AramisTech	South Florida	2025-06-26 05:14:56.413708	t	manual
10	Reliance Title Services	5	Incredible tech company. The level of skill and professionalism surpasses my expectations. They are truly gifted in their field. There has not been an issue they have not been able to resolve and always create a better option to make my company more efficient. They have provided all the tools to keep my business running at a high tech level and secured. Having the maintenance package has been game changer for us. Everything always runs flawlessly. We work in a very high paced industry and this company is on top of it all to keep us going. I highly recommend them.\n	AramisTech	South Florida	2025-06-26 05:15:18.716435	t	manual
4	One-Step Lien Search	5	We have been working with AramisTech for over 20 years, and they have been an integral part of our business's success and growth. Their dedication, professionalism, and expertise have remained unmatched throughout the decades. From day one, they have consistently provided reliable and efficient IT solutions tailored to our specific needs. 	AramisTech	South Florida	2025-06-26 05:13:10.898542	t	manual
\.


--
-- Data for Name: security_alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_alerts (id, is_enabled, title, message, button_text, button_link, background_color, text_color, icon_type, mobile_title, mobile_subtitle, mobile_description, mobile_button_text, created_at, updated_at, button_background_color, button_text_color, is_desktop_enabled, is_mobile_enabled, desktop_title, desktop_message, desktop_button_text, desktop_button_link, desktop_background_color, desktop_text_color, desktop_button_background_color, desktop_button_text_color, desktop_icon_type, mobile_button_link, mobile_background_color, mobile_text_color, mobile_button_background_color, mobile_button_text_color, mobile_icon_type) FROM stdin;
1	t	Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats	Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates.	Learn More	/windows10-upgrade	#dc2626	#ffffff	AlertTriangle	Windows 10 Support Ending	Did You Know?	Your Systems Will Become Vulnerable to New Threats. Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates, leaving them exposed to new cyber threats.	Get Protected Now	2025-06-28 18:26:30.344665	2025-06-28 18:26:30.344665	#ea580c	#fdfcfc	t	f	Did You Know?	Microsoft is ending Windows 10 support on October 14, 2025. Your systems will no longer receive security updates.	Learn More	/windows10-upgrade		#ffffff	#ea580c	#fdfcfc	AlertTriangle	/windows10-upgrade	#16a34a	#ffffff	#ffffff	#000000	Info
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_categories (id, name, description, icon, base_price, hourly_rate, is_active, display_order, created_at, updated_at) FROM stdin;
1	Network Setup	Complete network infrastructure setup and configuration	Network	500.00	150.00	t	1	2025-06-28 20:30:10.540343	2025-06-28 20:30:10.540343
2	Cybersecurity	Security assessments, implementation, and monitoring	Shield	800.00	175.00	t	2	2025-06-28 20:30:10.540343	2025-06-28 20:30:10.540343
3	Cloud Migration	Cloud infrastructure migration and setup	Cloud	1200.00	200.00	t	3	2025-06-28 20:30:10.540343	2025-06-28 20:30:10.540343
4	IT Support	Ongoing technical support and maintenance	Wrench	300.00	125.00	t	4	2025-06-28 20:30:10.540343	2025-06-28 20:30:10.540343
5	Software Development	Custom software solutions and applications	Code	2000.00	250.00	t	5	2025-06-28 20:30:10.540343	2025-06-28 20:30:10.540343
6	Remote Support	Remote diagnostics and technical assistance	Monitor	150.00	100.00	t	6	2025-06-28 20:30:10.540343	2025-06-28 20:30:10.540343
\.


--
-- Data for Name: service_options; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_options (id, category_id, name, description, price_modifier, price_type, is_required, is_active, display_order, created_at) FROM stdin;
1	1	24/7 Monitoring	Round-the-clock network monitoring and alerts	200.00	fixed	f	t	1	2025-06-28 20:30:20.901232
2	1	Advanced Firewall	Enterprise-grade firewall configuration	300.00	fixed	f	t	2	2025-06-28 20:30:20.901232
3	2	Penetration Testing	Comprehensive security vulnerability assessment	500.00	fixed	f	t	1	2025-06-28 20:30:20.901232
4	2	Employee Training	Cybersecurity awareness training program	150.00	fixed	f	t	2	2025-06-28 20:30:20.901232
5	3	Data Backup Setup	Automated cloud backup configuration	250.00	fixed	f	t	1	2025-06-28 20:30:20.901232
6	3	Legacy System Integration	Connect existing systems to cloud infrastructure	400.00	fixed	f	t	2	2025-06-28 20:30:20.901232
7	4	Priority Support	Expedited response times for critical issues	1.50	multiplier	f	t	1	2025-06-28 20:30:20.901232
8	5	Database Design	Custom database architecture and optimization	800.00	fixed	f	t	1	2025-06-28 20:30:20.901232
9	6	Emergency Response	After-hours emergency technical support	2.00	multiplier	f	t	1	2025-06-28 20:30:20.901232
\.


--
-- Data for Name: static_services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.static_services (id, name, description, price, setup_fee, icon, button_text, button_url, is_active, order_index, created_at, updated_at, button_color) FROM stdin;
11	Synology NAS Maintenance Service	A Synology NAS is a great alternative to a server. Our maintenance service and keep you NAS working smoothly all the time.\n\nProtect your data with our specialized Synology NAS maintenance service. We perform weekly checks on disk health, RAID integrity, system performance, firmware updates, and backup status. Whether you're using your NAS for file sharing, virtualization, or backup, we keep it running at peak efficiency and security.	$115.00	$590.00	cloud	Order Now	https://billing.aramistech.com/index.php?rp=/store/maintenance-services/synology-nas-maintenance-service	t	1	2025-06-30 02:29:55.921011	2025-06-30 02:29:55.921011	#f27121
10	Active Directory Server Maintenance Service	Weekly Active directory server maintenance and updates\n\nEnsure the stability, security, and efficiency of your network with our comprehensive Active Directory maintenance service. We perform routine audits of user and group policies, remove stale or inactive accounts, validate domain controller replication, and apply critical security patches, check backups and logs to make sure there's no issues with the operating system.\n\nThis proactive approach helps prevent access issues, strengthens cybersecurity, and keeps your organization's identity infrastructure running seamlessly.	$180.00	$90.00	server	Order Now	https://billing.aramistech.com/index.php?rp=/store/maintenance-services/active-directory-server-maintenance-service	t	2	2025-06-30 02:28:28.631583	2025-06-30 02:28:28.631583	#f27121
8	File Server Maintenance Service	Weekly File Server updates with unlimited support\n\nOur weekly file server maintenance ensures your server infrastructure remains stable, secure, and efficient. We conduct system diagnostics, monitor storage health, check backup status, apply necessary updates, and verify user access controls, Check logs for errors and security warnings, and correct them. This proactive approach protects your business data and improves server uptime.	$130/month	$80.00	database	Order Now	https://billing.aramistech.com/index.php?rp=/store/maintenance-services/file-server-maintenance-service	t	3	2025-06-30 02:02:55.556757	2025-06-30 02:02:55.556757	#f27121
9	Exchange 365 or Google Workspace Support	Complete enterprise-grade IT maintenance solution with dedicated support, comprehensive monitoring, and business continuity planning.	$89/month	$180.00	inbox	Order Now	https://billing.aramistech.com/index.php?rp=/store/maintenance-services/exchange-365-or-google-workspace-support	t	4	2025-06-30 02:02:55.556757	2025-06-30 02:02:55.556757	#f27121
12	Hourly Phone Support	Need IT support without a maintenance plan?\n\nOur hourly phone support provides fast, expert assistance whenever you need it. Ideal for troubleshooting, tech questions, or one-time issues, this service offers flexible, reliable help on demand.	$85.00		phoneCall	Order Service	https://billing.aramistech.com/index.php?rp=/store/maintenance-services/hourly-phone-support	t	5	2025-06-30 02:31:32.883777	2025-06-30 02:31:32.883777	#2563eb
7	Workstation PC/Mac Maintenance Service	Weekly Updates and unlimited support. Includes additional services.\n\nEnsure peak performance and minimize downtime with our proactive weekly maintenance service for Windows PCs and Apple Macs. We perform critical updates, security scans, disk health checks, and system optimizations to keep your workstations secure, fast, and reliable. This service helps detect and prevent issues before they impact your business operations.	$51/month	$35.00	server	Order Now	https://billing.aramistech.com/index.php?rp=/store/maintenance-services/workstation-pcmac-maintenance-service	t	0	2025-06-30 02:02:55.556757	2025-06-30 02:02:55.556757	#f27121
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, email, is_active, last_login, created_at, updated_at, two_factor_secret, two_factor_enabled, backup_codes) FROM stdin;
4	Aramis	$2b$10$7iMXiov/zvgnF1tl14my0uEvZvhojaMnP5fNf0yPeFQqsX8lU4RNK	aramis@aramistech.com	t	\N	2025-06-26 06:21:36.03048	2025-06-30 20:46:06.483	IJ6SGDLKKRWT6QZY	t	{34478BFE,9DD42CF3,F150E6BB,E30689D9,B29DDD48,5CDCD357,600804DC,95E294D4,E4FEDBB2,96044940}
9	Gabriel	$2b$10$rYc8v/mcSHzs9VOAQ3m6L.scgUoD2p6lswsnOZa.3szeXhlz9qq/m	gabriel@aramistech.com	t	\N	2025-06-30 20:05:29.640441	2025-06-30 20:48:53.764	BJ5QOPRIEJKRSCK3	t	{7AB9BEAE,E8FEA1AB,73FD5EC8,160035D9,119D2E84,80852D90,338208FE,9E040A1B,9824688F,625DFF6E}
11	testadmin	$2b$10$PO4yfaqQPl3yJJCXXPcyLeebGI.SLB6QwZqosW6bSD6mTBRuDGRFm	test@admin.com	t	\N	2025-07-23 14:43:28.390706	2025-07-23 14:43:28.390706	\N	f	\N
\.


--
-- Name: admin_chat_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_chat_settings_id_seq', 1, true);


--
-- Name: ai_consultations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_consultations_id_seq', 1, false);


--
-- Name: blocked_countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.blocked_countries_id_seq', 71, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 33, true);


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.chat_sessions_id_seq', 11, true);


--
-- Name: color_palette_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.color_palette_id_seq', 17, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 4, true);


--
-- Name: country_blocking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.country_blocking_id_seq', 1, true);


--
-- Name: exit_intent_popup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.exit_intent_popup_id_seq', 1, true);


--
-- Name: footer_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.footer_links_id_seq', 12, true);


--
-- Name: it_consultations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.it_consultations_id_seq', 2, true);


--
-- Name: knowledge_base_articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.knowledge_base_articles_id_seq', 21, true);


--
-- Name: knowledge_base_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.knowledge_base_categories_id_seq', 6, true);


--
-- Name: media_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.media_files_id_seq', 59, true);


--
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 24, true);


--
-- Name: page_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.page_content_id_seq', 1, false);


--
-- Name: pricing_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pricing_calculations_id_seq', 1, false);


--
-- Name: quick_quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quick_quotes_id_seq', 8, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 10, true);


--
-- Name: security_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.security_alerts_id_seq', 1, true);


--
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 6, true);


--
-- Name: service_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_options_id_seq', 9, true);


--
-- Name: static_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.static_services_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: admin_chat_settings admin_chat_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_chat_settings
    ADD CONSTRAINT admin_chat_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: ai_consultations ai_consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_consultations
    ADD CONSTRAINT ai_consultations_pkey PRIMARY KEY (id);


--
-- Name: blocked_countries blocked_countries_country_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_countries
    ADD CONSTRAINT blocked_countries_country_code_unique UNIQUE (country_code);


--
-- Name: blocked_countries blocked_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_countries
    ADD CONSTRAINT blocked_countries_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_session_id_unique UNIQUE (session_id);


--
-- Name: color_palette color_palette_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.color_palette
    ADD CONSTRAINT color_palette_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: country_blocking country_blocking_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.country_blocking
    ADD CONSTRAINT country_blocking_pkey PRIMARY KEY (id);


--
-- Name: exit_intent_popup exit_intent_popup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exit_intent_popup
    ADD CONSTRAINT exit_intent_popup_pkey PRIMARY KEY (id);


--
-- Name: footer_links footer_links_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.footer_links
    ADD CONSTRAINT footer_links_pkey PRIMARY KEY (id);


--
-- Name: it_consultations it_consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.it_consultations
    ADD CONSTRAINT it_consultations_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base_articles knowledge_base_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_articles
    ADD CONSTRAINT knowledge_base_articles_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base_articles knowledge_base_articles_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_articles
    ADD CONSTRAINT knowledge_base_articles_slug_unique UNIQUE (slug);


--
-- Name: knowledge_base_categories knowledge_base_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_categories
    ADD CONSTRAINT knowledge_base_categories_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base_categories knowledge_base_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_categories
    ADD CONSTRAINT knowledge_base_categories_slug_unique UNIQUE (slug);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: page_content page_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_pkey PRIMARY KEY (id);


--
-- Name: pricing_calculations pricing_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_calculations
    ADD CONSTRAINT pricing_calculations_pkey PRIMARY KEY (id);


--
-- Name: quick_quotes quick_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quick_quotes
    ADD CONSTRAINT quick_quotes_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: security_alerts security_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_options service_options_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_options
    ADD CONSTRAINT service_options_pkey PRIMARY KEY (id);


--
-- Name: static_services static_services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.static_services
    ADD CONSTRAINT static_services_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: admin_chat_settings admin_chat_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_chat_settings
    ADD CONSTRAINT admin_chat_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: admin_sessions admin_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: chat_messages chat_messages_session_id_chat_sessions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_chat_sessions_id_fk FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_admin_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_admin_user_id_users_id_fk FOREIGN KEY (admin_user_id) REFERENCES public.users(id);


--
-- Name: knowledge_base_articles knowledge_base_articles_category_id_knowledge_base_categories_i; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base_articles
    ADD CONSTRAINT knowledge_base_articles_category_id_knowledge_base_categories_i FOREIGN KEY (category_id) REFERENCES public.knowledge_base_categories(id);


--
-- Name: service_options service_options_category_id_service_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_options
    ADD CONSTRAINT service_options_category_id_service_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

