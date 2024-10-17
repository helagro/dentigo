--
-- PostgreSQL database dump
--

--
-- Name: clinicNotificationSubscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."clinicNotificationSubscription" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clinicId" character varying NOT NULL,
    "userEmail" character varying NOT NULL
);

--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    message character varying NOT NULL,
    email character varying NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);
