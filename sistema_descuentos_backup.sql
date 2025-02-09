--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: actualizar_monto_total(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_monto_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.monto_total := NEW.monto_descuento + NEW.monto_ingreso;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_monto_total() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: canjes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canjes (
    id integer NOT NULL,
    codigo_id integer,
    negocio_id integer,
    metodo_canje character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.canjes OWNER TO postgres;

--
-- Name: canjes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.canjes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.canjes_id_seq OWNER TO postgres;

--
-- Name: canjes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.canjes_id_seq OWNED BY public.canjes.id;


--
-- Name: codigos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.codigos (
    id integer NOT NULL,
    negocio_id integer,
    codigo character varying(50) NOT NULL,
    porcentaje integer NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_fin timestamp without time zone NOT NULL,
    estado boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    codigo_qr text,
    email character varying(100)
);


ALTER TABLE public.codigos OWNER TO postgres;

--
-- Name: codigos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.codigos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.codigos_id_seq OWNER TO postgres;

--
-- Name: codigos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.codigos_id_seq OWNED BY public.codigos.id;


--
-- Name: descuentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.descuentos (
    id integer NOT NULL,
    negocio_id integer,
    codigo character varying(50) NOT NULL,
    porcentaje integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.descuentos OWNER TO postgres;

--
-- Name: descuentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.descuentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.descuentos_id_seq OWNER TO postgres;

--
-- Name: descuentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.descuentos_id_seq OWNED BY public.descuentos.id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    negocio_id integer,
    monto_descuento numeric(10,2) DEFAULT 25.00,
    monto_ingreso numeric(10,2) DEFAULT 25.00,
    monto_total numeric(10,2) DEFAULT 50.00,
    fecha_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_pago timestamp without time zone,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    canje_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_aceptacion timestamp without time zone
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: facturas_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas_backup (
    id integer,
    negocio_id integer,
    monto numeric(10,2),
    concepto text,
    fecha_vencimiento date,
    pagada boolean,
    fecha_pago timestamp without time zone,
    created_at timestamp without time zone
);


ALTER TABLE public.facturas_backup OWNER TO postgres;

--
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_seq OWNER TO postgres;

--
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- Name: formularios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formularios (
    id integer NOT NULL,
    negocio_id integer,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    telefono character varying(20),
    mensaje text,
    atendido boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.formularios OWNER TO postgres;

--
-- Name: formularios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formularios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formularios_id_seq OWNER TO postgres;

--
-- Name: formularios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formularios_id_seq OWNED BY public.formularios.id;


--
-- Name: negocios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.negocios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    telefono character varying(20),
    usuario character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    codigo_qr text,
    estado boolean DEFAULT true,
    role character varying(20) DEFAULT 'business'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.negocios OWNER TO postgres;

--
-- Name: negocios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.negocios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.negocios_id_seq OWNER TO postgres;

--
-- Name: negocios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.negocios_id_seq OWNED BY public.negocios.id;


--
-- Name: redenciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redenciones (
    id integer NOT NULL,
    descuento_id integer,
    usuario_id integer,
    fecha_redencion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT true
);


ALTER TABLE public.redenciones OWNER TO postgres;

--
-- Name: redenciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.redenciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.redenciones_id_seq OWNER TO postgres;

--
-- Name: redenciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.redenciones_id_seq OWNED BY public.redenciones.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying,
    estado boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usuario character varying(50)
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: canjes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canjes ALTER COLUMN id SET DEFAULT nextval('public.canjes_id_seq'::regclass);


--
-- Name: codigos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos ALTER COLUMN id SET DEFAULT nextval('public.codigos_id_seq'::regclass);


--
-- Name: descuentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos ALTER COLUMN id SET DEFAULT nextval('public.descuentos_id_seq'::regclass);


--
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- Name: formularios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formularios ALTER COLUMN id SET DEFAULT nextval('public.formularios_id_seq'::regclass);


--
-- Name: negocios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.negocios ALTER COLUMN id SET DEFAULT nextval('public.negocios_id_seq'::regclass);


--
-- Name: redenciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redenciones ALTER COLUMN id SET DEFAULT nextval('public.redenciones_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: canjes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.canjes (id, codigo_id, negocio_id, metodo_canje, created_at) FROM stdin;
1	11	1	qr	2025-02-09 17:21:53.520862
2	11	1	qr	2025-02-09 17:21:53.524748
3	10	1	qr	2025-02-09 17:23:26.098785
4	10	1	qr	2025-02-09 17:23:26.099915
5	9	1	qr	2025-02-09 17:26:24.11041
6	9	1	qr	2025-02-09 17:26:24.110724
10	14	12	manual	2025-02-09 20:23:27.789438
\.


--
-- Data for Name: codigos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.codigos (id, negocio_id, codigo, porcentaje, fecha_inicio, fecha_fin, estado, created_at, codigo_qr, email) FROM stdin;
1	1	GYLGHQ	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 16:51:28.829747	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATdSURBVO3BQW4kwREEwfDC/P/LLh7zVFCjcyiuEGb4I1VLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkWfvATkN6mZgNyomYBMap4AcqNmAvKEmgnIb1LzxknVopOqRSdViz5ZpmYTkCfU3KiZgExqJiA3aiYgN2reULMJyKaTqkUnVYtOqhZ98mVAnlDzhJobIJOaGyBvqHkCyKTmCSBPqPmmk6pFJ1WLTqoWffKPA3KjZgJyo+YNIJOaCcik5v/JSdWik6pFJ1WLPvnHqbkBcqNmAjKpqf/eSdWik6pFJ1WLPvkyNf8SNROQSc2NmgnIDZBJzRNq/pKTqkUnVYtOqhZ9sgzIbwIyqblRMwGZ1DwBZFJzo2YC8gSQv+ykatFJ1aKTqkWfvKTmLwHyBpA3gNwAeULNv+SkatFJ1aKTqkX4Iy8AmdRMQG7UTECeUDMB+U1qJiCTmgnIpOYGyKTmBsikZgJyo+aNk6pFJ1WLTqoW4Y+8AGSTmhsgN2p+E5BJzQTkN6mZgExqJiCTmjdOqhadVC06qVqEP/ICkEnNE0AmNROQGzVvAJnUTEAmNZuATGqeAPKGmk0nVYtOqhadVC3CH3kByI2aCcikZgIyqZmAvKHmBsgbat4AMqn5JiCTmjdOqhadVC06qVr0yTI1E5AbIJOaCcikZgLyBpBJzQ2QSc0E5EbNjZobIJOaCciNmknNppOqRSdVi06qFuGPvADkRs0EZFIzAZnUTEAmNROQSc0EZFIzAZnUTEAmNTdAnlAzAZnUPAHkCTVvnFQtOqladFK16JP/MSA3QG6ATGpu1ExAJjUTkEnNDZBJzQRkUjMBmdRMQCY1E5BJzQTkm06qFp1ULTqpWvTJH6fmBsgEZFLzBJBJzQRkUjOpmYBMaiYgk5oJyKTmLzupWnRSteikahH+yCIgT6i5ATKpeQPIpOYNIJOaGyBPqJmA3Kj5XzqpWnRSteikatEny9TcAJmA3Kh5A8gTQCY1N2qeUHMD5Ak1f8lJ1aKTqkUnVYvwR14AMqmZgExqJiBPqJmA3KjZBGRSMwG5UbMJyI2aCcikZtNJ1aKTqkUnVYs+eUnNN6l5A8gTam7UPKFmAvKEmhs1N0BugExq3jipWnRSteikahH+yCIgb6iZgExqngDyhpoJyI2aCchfouabTqoWnVQtOqla9MkyNZvU3AD5JiCb1ExAJjVPAJnUPAFkUvPGSdWik6pFJ1WLPnkJyG9Ss0nNBGRScwPkCSBPAJnUvAFkUrPppGrRSdWik6pFnyxTswnIE2omIDdAJjU3QCY136TmCSCTmt90UrXopGrRSdWiT74MyBNqnlAzAblRMwG5AfKGmhsgE5BNQH7TSdWik6pFJ1WLPvnHAXkCyA2QGzUTkEnNBGRS84SaCciNmieATGreOKladFK16KRq0Sf/Z9RMQCY1E5AbNW+ouVHzhpoJyI2abzqpWnRSteikatEnX6bmm9Q8AeRGzQ2QN4DcqJmATGpu1NwAmdRsOqladFK16KRq0SfLgPwmIE+ouQHyhJoJyDcBmdT8JSdVi06qFp1ULcIfqVpyUrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULfoPR6hOIdtbDdUAAAAASUVORK5CYII=	\N
2	1	03LJET	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 16:53:15.763613	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATQSURBVO3BQY4jRxAEwfAC//9l1xzzVECjk6PVKszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1JzA2STmgnIpOYJIDdqJiC/Sc0bJ1WLTqoWnVQt+mSZmk1AnlAzAXkDyBNAJjWTmgnIE2o2Adl0UrXopGrRSdWiT74MyBNqngAyqXlCzQRkUjMBuVEzAfkmIE+o+aaTqkUnVYtOqhZ98pcBcqNmAjKpmYDcALlRMwGZ1PxNTqoWnVQtOqla9Mn/DJAn1ExAbtRMQP5PTqoWnVQtOqla9MmXqflNam6AvKFmAvKEmk1q/iQnVYtOqhadVC36ZBmQPwmQSc0E5AbIpGYTkEnNDZA/2UnVopOqRSdViz55Sc2fTM0mIE+ouVFzo+a/5KRq0UnVopOqRZ+8BGRSMwHZpGZS801qJiA3QCY1N0AmNROQTWq+6aRq0UnVopOqRZ8sAzKpmYBMaiYgk5obIJOaCcik5gbIE2omIBOQGzUTkDfUPAFkUvPGSdWik6pFJ1WL8Ee+CMgTaiYgk5oJyG9SMwGZ1LwB5EbNBGRS8286qVp0UrXopGrRJy8BmdQ8oWYCMqnZpOYGyKRmAvIEkEnNE2omIJOaJ4BMajadVC06qVp0UrXokz+MmgnIG2pugExqJiCTmhsgk5obIJOaGzU3QG7UfNNJ1aKTqkUnVYvwR14AcqNmAnKj5gkgk5obIJOaJ4BMaiYgT6iZgLyhZgIyqZmATGreOKladFK16KRq0Sf/MjUTkBs1N0AmNZvUTEAmNROQSc2NmgnIN6nZdFK16KRq0UnVIvyRRUAmNTdAbtS8AWRSMwGZ1ExAJjW/CcikZgIyqbkBMqnZdFK16KRq0UnVIvyRF4DcqJmATGomIE+omYA8oeYJIE+ouQEyqdkEZFLzTSdVi06qFp1ULfrky4BMaiYgN2reUHMD5A01N0Bu1NwA+SYgk5o3TqoWnVQtOqlahD/yApBJzQ2QTWomIDdqboC8oeYJIDdqJiCTmgnIjZpvOqladFK16KRq0Se/TM2/Ccik5kbNDZAbIDdqboBMaiYgk5obIJOaTSdVi06qFp1ULfrky4BMam6APKHmRs0TaiYgk5pJzQRkUnMD5AkgTwC5ATKpeeOkatFJ1aKTqkX4I/9hQG7U3ACZ1NwAmdTcAHlCzRNANql546Rq0UnVopOqRZ+8BOQ3qZnUTEC+Sc0EZFKzCcik5g0133RSteikatFJ1aJPlqnZBOQGyKRmAvIGkEnNE2pugNyoeUPNbzqpWnRSteikatEnXwbkCTWb1ExAJjU3ap4AMql5AsgbaiYgk5oJyKTmjZOqRSdVi06qFn3ylwNyA+QJNZOaTWreAPKEmk0nVYtOqhadVC365C8DZFLzBJBJzQRkUjMBuVHzBJAn1NwAmdRsOqladFK16KRq0Sdfpuab1NwAmdRMQCY1E5An1ExAJiBPqJmATGomIJOa33RSteikatFJ1aJPlgH5TUBu1ExAJjWbgNyouQEyqXlCzQRkUvNNJ1WLTqoWnVQtwh+pWnJSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQt+geEYUYdaG7eHgAAAABJRU5ErkJggg==	a@a.com
3	1	DFCZP3	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 16:54:52.26431	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAT+SURBVO3BQQ4jRxLAQLKg/3+Z62OeGmioNDs2MsL+wVqXHNa66LDWRYe1LjqsddFhrYsOa110WOuiw1oXHda66LDWRYe1LjqsddFhrYsOa110WOuiD19S+ZMqnqj8UsWkMlU8UZkqnqj8SRXfOKx10WGtiw5rXfThsoqbVJ6oTBVvqEwVk8qkMlU8UXmiMlU8qbhJ5abDWhcd1rrosNZFH35M5Y2KNyreUJkqJpUnFZPKVPFGxTdU3qj4pcNaFx3Wuuiw1kUf/mNUpoqp4hsq36j4LzusddFhrYsOa1304V9O5YnKVDGpTBWTyk0qTyr+zQ5rXXRY66LDWhd9+LGKX6q4SWWqmFSmikllqphUpopvVPxNDmtddFjrosNaF324TOVPUpkqJpWp4knFpDJVTCpTxaQyVUwqU8UTlb/ZYa2LDmtddFjrIvsH/yEqU8UbKm9UTCpvVPyXHNa66LDWRYe1LvrwJZWpYlKZKiaVqWJSmSqeVLyhMlVMKlPFpPKk4pdUpoonKlPFTYe1LjqsddFhrYvsH/yQyjcqJpUnFZPKGxWTypOKm1SeVDxRmSqeqEwV3zisddFhrYsOa1304ccq3lCZVKaKb1RMKpPKVPFLKlPFGypTxaTyJx3Wuuiw1kWHtS76cJnKk4onFU9Ubqp4Q2WqmFSmikllqphUpoo3VKaKSWWquOmw1kWHtS46rHXRh8sqnqg8qZhUvlHxN6l4Q2WqmComlTdUpopvHNa66LDWRYe1LvpwmcpU8aRiUpkqnqhMFZPKk4pJZaqYKiaVqeJvojJVTCo3Hda66LDWRYe1LvpwWcWk8g2VqWKqmFSmikllUpkqJpUnFU9UpopJ5UnFpPKk4onKLx3Wuuiw1kWHtS768IdVTCpPKm6qeKLyhsobKlPFE5UnFZPKVPGk4qbDWhcd1rrosNZFHy5TmSreqJhUpopJZaqYVKaKJxWTylTxRGWqeEPlScWTijdUpopvHNa66LDWRYe1LvrwYypTxRsVk8pU8aRiUnlS8UTllyomlW+oTBWTyk2HtS46rHXRYa2LPnxJZap4ovKGyjdUpoonKlPFE5Wp4pdUpopJZaqYVH7psNZFh7UuOqx10YcvVUwqTyomlUllqphUJpWp4hsVT1SeqEwVf7OKmw5rXXRY66LDWhfZP/iCylQxqTypmFTeqHii8kbFE5WpYlKZKp6o3FTx/3RY66LDWhcd1rrow5cqnlS8UfGGylQxVUwqT1Smij+p4g2VJypvVHzjsNZFh7UuOqx10YcvqfxJFVPFNyqeqLxRMal8Q2WqeKIyVUwqv3RY66LDWhcd1rrow2UVN6m8ofKk4onKk4pJ5Zcq3qh4UvFLh7UuOqx10WGtiz78mMobFW+oPKl4ojJVTCqTylQxqUwVT1QmlV9SmSpuOqx10WGtiw5rXfThX65iUnmjYlJ5UvGGyhsVT1TeUJkqfumw1kWHtS46rHXRh385laniicpU8Q2VNyqeqEwVv6QyVXzjsNZFh7UuOqx10Ycfq/iliknlpopJZaqYVKaKJypTxZOKSeVJxaQyVdx0WOuiw1oXHda66MNlKn+SypOKNyqeVEwqT1SmijdUnlR8Q2Wq+MZhrYsOa110WOsi+wdrXXJY66LDWhcd1rrosNZFh7UuOqx10WGtiw5rXXRY66LDWhcd1rrosNZFh7UuOqx10WGti/4HSvtbRPGuk1wAAAAASUVORK5CYII=	a@a.com
4	1	0QGN51	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 16:57:03.465288	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATHSURBVO3BQY4kRxIEQdNA/f/Lun1bPwWQSK/mcGgi+CNVS06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFn7wE5DepuQHyhJoJyKRmAjKpeQLIjZoJyG9S88ZJ1aKTqkUnVYs+WaZmE5BvAnID5Akgk5pJzQTkCTWbgGw6qVp0UrXopGrRJ18G5Ak1TwC5UfMEkEnNBORGzQTkm4A8oeabTqoWnVQtOqla9MlfRs0NkEnNpGYCcgPkRs0EZFLzNzmpWnRSteikatEn/3FAJjWTmgnIpOYGyH/JSdWik6pFJ1WLPvkyNb8JyBNqfpOaTWr+JCdVi06qFp1ULfpkGZB/kpoJyKRmAjKpmYBMaiYgk5ongExqboD8yU6qFp1ULTqpWoQ/8i8GZFJzA2RScwPkRk3930nVopOqRSdViz55CcikZgKySc2k5gbIpGYCMqmZ1ExAboBMam6ATGomIJvUfNNJ1aKTqkUnVYs++WVqboBMaiYgk5pNQJ4AcgPkRs0E5A01TwCZ1LxxUrXopGrRSdUi/JF/EJAn1ExAJjVPAHlDzSYgN2omIJOaf9JJ1aKTqkUnVYs+WQbkDTU3QG6A3KiZ1ExAJjUTkCeATGqeUDMBmdQ8AWRSs+mkatFJ1aKTqkX4I38wIDdqJiCTmhsgk5oJyBtqboBMat4AcqPmm06qFp1ULTqpWoQ/8kVAbtRMQCY1E5AbNROQGzVPANmkZgLyhpoJyKRmAjKpeeOkatFJ1aKTqkWfLAMyqXlCzQTkRs0E5Akgk5on1NwAmdTcqJmAfJOaTSdVi06qFp1ULcIfeQHIG2omIJOaGyA3at4A8oSaTUAmNROQSc0NkEnNppOqRSdVi06qFuGPfBGQ36RmAjKpmYBMam6APKHmBsikZhOQSc03nVQtOqladFK16JOXgNyoeQLIpOY3AXlCzQ2QGzU3QL4JyKTmjZOqRSdVi06qFuGPvABkUjMBmdRMQJ5Q8waQN9RMQCY1TwC5UTMBmdRMQG7UfNNJ1aKTqkUnVYs++cOouQEyqZmATGomNROQGzVvALlRcwNkUjMBmdTcAJnUbDqpWnRSteikahH+yAtAJjU3QN5QMwF5Qs0TQCY1N0AmNTdANqmZgDyh5o2TqkUnVYtOqhbhj/yLAblRcwNkUnMDZFJzA+QJNU8A2aTmjZOqRSdVi06qFn3yEpDfpGZScwNkk5oJyKRmE5BJzRtqvumkatFJ1aKTqkWfLFOzCcgNkEnNpOYNIJOaJ9TcALlR84aa33RSteikatFJ1aJPvgzIE2r+JGqeADKpeQLIG2omIJOaCcik5o2TqkUnVYtOqhZ98pcBMqmZgNyomYBMaiY1m9S8AeQJNZtOqhadVC06qVr0yV9GzY2aGyCTmgnIpGYCcqPmCSBPqLkBMqnZdFK16KRq0UnVok++TM03qbkBMqmZgExqJiBPqJmATECeUDMBmdRMQCY1v+mkatFJ1aKTqkWfLAPym4BMaiY1N2o2AblRcwNkUvOEmgnIpOabTqoWnVQtOqlahD9SteSkatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqla9D8Z6UkIJMQA4AAAAABJRU5ErkJggg==	\N
5	1	QDIHI9	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 16:58:25.222748	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATRSURBVO3BQY4bSRAEwfAC//9l3znmqYBGJ2clIczwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1IzAZnUTEAmNTdAJjUTkEnNE0Bu1ExAfpOaN06qFp1ULTqpWvTJMjWbgDwBZFKzSc0TQCY1b6jZBGTTSdWik6pFJ1WLPvkyIE+oeULNDZAn1DwBZFIzqbkBMql5AsgTar7ppGrRSdWik6pFn/zlgExqJjUTkCeAPAFkUjMBmdT8S06qFp1ULTqpWvTJX07NBGRSs0nNDZAngExq/mYnVYtOqhadVC365MvU/CY1N2pugExqJiA3ap5Q84aaP8lJ1aKTqkUnVYs+WQbkNwGZ1ExAJjUTkEnNBGRSMwG5ATKpmYBMam6A/MlOqhadVC06qVr0yUtq/iRAJjUTkEnNjZongGxS8zc5qVp0UrXopGrRJy8BmdRMQG7UTECeUDMBeQPIpGYCMqmZgNwAeQLIpOYGyKRmAnKj5o2TqkUnVYtOqhbhjywCMqmZgNyoeQLIpOYGyBtqboA8oWYC8oaaJ4BMat44qVp0UrXopGrRJ79MzRNAJjWTmgnIE2omIJOaTWomIJOaCciNmhsgN2o2nVQtOqladFK1CH/kBSBPqLkBMqm5AfKEmv8TkEnNDZA31NwAmdS8cVK16KRq0UnVIvyRF4A8oWYC8oSaJ4DcqLkBMqm5ATKpuQEyqXkDyI2abzqpWnRSteikatEnL6mZgGxS84aaTUBu1NwAeQLIpOZGzQ2QGzVvnFQtOqladFK16JOXgNyomYBMam6A3KiZgExqJiBPqPkmNROQSc0EZFIzAfk/nVQtOqladFK1CH/kBSDfpOYNIJOaJ4BMan4TkEnNBGRScwNkUrPppGrRSdWik6pFn7ykZgIyqZmATGomIBOQSc0EZFJzA2RS8wSQSc0NkEnNDZBJzQTkT3ZSteikatFJ1aJPvgzIpOYJNTdqJiCTmk1qnlDzTWpugPymk6pFJ1WLTqoWffISkEnNDZAbNROQSc0EZFIzAblRMwG5AXKj5gkgm4DcqPmmk6pFJ1WLTqoW4Y/8w4BMaiYgT6i5ATKpmYBsUnMDZFLzTSdVi06qFp1ULcIfWQTkRs0TQCY1E5A31ExA/mVqvumkatFJ1aKTqkX4I38xIJOaJ4BMajYBeULNE0A2qXnjpGrRSdWik6pFn7wE5DepuQFyo2ZScwPkDTUTkCeATGqeUDMBmdRsOqladFK16KRq0SfL1GwC8oaaCcgmNTdA3lDzhJongExq3jipWnRSteikatEnXwbkCTVPqHlDzRtAbtTcAJmAbAIyqZmAbDqpWnRSteikatEnfzkgk5ongNyomYBMaiYgE5BJzaRmAjKpmYDcAJnUTEAmNZtOqhadVC06qVr0yT8GyI2aN9RMQG7UTEA2qZmA3KiZgExq3jipWnRSteikatEnX6bmm9S8AWRSMwG5UXMD5Ak13wRkUrPppGrRSdWik6pFnywD8puA3Ki5UfOEmifU3AB5Qs0EZFLzfzqpWnRSteikahH+SNWSk6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatF/Hi9KFnMudYcAAAAASUVORK5CYII=	\N
6	1	F8BPTO	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 17:00:07.790005	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAT2SURBVO3BQYocQRAEwfBi/v9l1x7zVNB0ziKJMMMfqVpyUrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULfrkJSC/Sc0bQCY1E5AbNROQSc0NkEnNDZDfpOaNk6pFJ1WLTqoWfbJMzSYgN0Bu1ExqJiCTmgnIBGRScwPkBsik5kbNJiCbTqoWnVQtOqla9MmXAXlCzRNqboA8AeRGzQRkUvOEmjeAPKHmm06qFp1ULTqpWvTJfwbIpOYJIDdAJjVPqPmfnVQtOqladFK16JN/HJAngExqJjUTkEnNBGRScwPkRs2/7KRq0UnVopOqRZ98mZpvUjMBmYDcALlR8wSQSc0EZFLzhpq/yUnVopOqRSdViz5ZBuQ3AZnUTEAmNROQSc0EZFJzo2YCMqmZgExqboD8zU6qFp1ULTqpWoQ/8h8B8oSaCcgTaiYgT6j5n5xULTqpWnRSteiTl4BMaiYgk5oJyKRmAjKpeULNE2omIDdAbtR8E5BJzQ2QSc2mk6pFJ1WLTqoW4Y+8AORGzQRkUvMGkEnNDZBJzQ2QGzWbgNyouQEyqbkBMql546Rq0UnVopOqRZ/8ZYA8oeYNIDdqboBMap4AMql5AsikZgLym06qFp1ULTqpWoQ/8gKQSc0EZFIzAblRMwG5UfMEkEnNG0AmNROQSc0EZFJzA+RGzQRkUrPppGrRSdWik6pF+CO/CMikZgKySc0E5EbNG0AmNU8AuVFzA2RSMwG5UfPGSdWik6pFJ1WLPnkJyCY1N0AmNZuATGpugExq/iZAJjUTkE0nVYtOqhadVC365CU1E5BJzQTkCSCTmieAPKFmAjKpeQLIpGYCcqNmAnKj5gbIN51ULTqpWnRSteiTl4BMap4AcqNmAjKpmYDcqJmATEDeAHIDZFJzA+RGzQRkUnOjZtNJ1aKTqkUnVYvwRxYBeULNDZAbNTdAnlAzAXlDzRNAbtS8AeRGzRsnVYtOqhadVC36ZJmaJ4DcqJmA3AC5UfOGmhsgb6iZgLwBZFIzAdl0UrXopGrRSdUi/JEXgExq3gCySc0E5Ak1N0AmNZuA3KiZgExqJiA3at44qVp0UrXopGrRJy+pmYBsUnMD5AbIE2reADKp+Zup2XRSteikatFJ1aJPXgIyqXkCyKRmAnKjZgIyqbkB8gSQSc0E5AkgbwCZ1Nyo+aaTqkUnVYtOqhZ98pKaN9TcqLkBMqmZgExqboBMan6TmieA3AB5Qs0bJ1WLTqoWnVQt+uQlIL9JzaTmRs0EZFJzA+QJNROQN4BMam6ATGomIN90UrXopGrRSdWiT5ap2QTkm4A8oWYC8k1qnlBzo+abTqoWnVQtOqla9MmXAXlCzRNAJjUTkCfUTEAmIJOaCcik5gbIBOSbgExqNp1ULTqpWnRSteiTf5yaJ9RMQJ5Q8wSQJ9TcAHkCyKTmm06qFp1ULTqpWvTJPw7IpGZSMwHZBOQJNTdAJjXfBGRS88ZJ1aKTqkUnVYs++TI136TmBsgTQG6ATGomIJOaGyCTmhs1E5AbNROQSc2mk6pFJ1WLTqoWfbIMyG8C8oaaGyCTmgnIDZBJzRNAbtS8AWRS88ZJ1aKTqkUnVYvwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYv+AKH1Rlm2Z+sNAAAAAElFTkSuQmCC	a2@a.com
7	1	NB0HP4	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 17:02:25.637258	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATESURBVO3BQY4jRxAEwfAC//9l1xzzVECjkyNpN8zwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1JzA+QJNROQSc0EZFLzBJAbNROQ36TmjZOqRSdVi06qFn2yTM0mIE+omYBMaiYgN0CeADKpmdRMQJ5QswnIppOqRSdVi06qFn3yZUCeUPMEkEnNJjUTkBs1E5BvAvKEmm86qVp0UrXopGrRJ38YIE+ouQHyBJBJzQRkUvMnOaladFK16KRq0Sd/GSA3aiY1E5AJyKRmAvI3OaladFK16KRq0SdfpuY3qZmATGomIG+oeULNJjX/JSdVi06qFp1ULfpkGZA/CZBJzQRkUvMEkEnNDZD/spOqRSdVi06qFn3ykpq/CZBJzY2aGzU3av5PTqoWnVQtOqlahD/yApBJzQRkk5obIJOabwJyo+YGyKRmArJJzTedVC06qVp0UrXoky9TMwGZ1DwBZFLzBJDfBORGzQTkDTVPAJnUvHFSteikatFJ1SL8kUVAbtTcAPkmNTdAnlCzCciNmgnIpObfdFK16KRq0UnVIvyRF4BMaiYgb6iZgPwmNROQGzUTkEnNDZBJzQRkUvMEkEnNppOqRSdVi06qFuGPvADkRs0TQJ5QcwPkCTUTkEnNDZBJzQ2QSc0bQG7UfNNJ1aKTqkUnVYs+eUnNBOQGyKTmRs0E5AbIjZon1NwAuQFyo2YC8oaaCcgNkEnNGydVi06qFp1ULfrkJSCTmjfUTEBugExqboBMajapmYBMam7UTEC+Sc2mk6pFJ1WLTqoWfbIMyBNAbtRMQCY1bwCZ1ExA3lCzSc0E5EbNBGRSs+mkatFJ1aKTqkX4Iy8AeULNBOQJNROQN9S8AeRGzQ2QSc0mIJOabzqpWnRSteikatEny9Q8oeYJIJOaTUBu1ExqboDcqLkB8k1AJjVvnFQtOqladFK16JNfBmRScwPkBsik5gbIpOYJIJOaGzU3QG7UTEAmNROQJ9RsOqladFK16KRq0SdfBuQNNROQJ4BMap5QcwNkUjMBuVFzA2RSMwGZ1NwAmdRsOqladFK16KRqEf7IC0AmNU8AmdRMQCY1E5A31NwAuVEzAZnU3ADZpGYC8oSaN06qFp1ULTqpWoQ/8j8GZFJzA+RGzSYgT6h5AsgmNW+cVC06qVp0UrXok5eA/CY1k5oJyKTmm4BMajYBmdS8oeabTqoWnVQtOqla9MkyNZuA3ACZ1ExAJjUTkBsgk5on1NwAuVHzhprfdFK16KRq0UnVok++DMgTajapmYBMam7UPAFkUvMEkDfUTEAmNROQSc0bJ1WLTqoWnVQt+uQPA2RScwPkCTWTmk1q3gDyhJpNJ1WLTqoWnVQt+uQPo+YNNROQCcikZgJyo+YJIE+ouQEyqdl0UrXopGrRSdWiT75MzTepmYA8oeZGzQTkRs0EZALyhJoJyKRmAjKp+U0nVYtOqhadVC36ZBmQ3wRkUnMD5AbIpOYJIDdqboBMap5QMwGZ1HzTSdWik6pFJ1WL8EeqlpxULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WL/gFgTT4ZD2AmNQAAAABJRU5ErkJggg==	a3@a.com
8	1	G0SX2N	10	2025-02-09 00:00:00	2025-02-16 00:00:00	t	2025-02-09 17:05:32.863968	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATVSURBVO3BQY4jRxAEwfAC//9l1xzzVECjk6OVNszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1LzBJBJzQTkRs0EZFLzBJAbNROQ36TmjZOqRSdVi06qFn2yTM0mIE8A2QTkCSCTmknNBOQJNZuAbDqpWnRSteikatEnXwbkCTVPALlR84aaCciNmgnINwF5Qs03nVQtOqladFK16JO/DJBJzQ2QGyA3aiYgk5r/k5OqRSdVi06qFn3yP6NmAvKGmhsgk5oJyN/kpGrRSdWik6pFn3yZmn+Tmk1A3lCzSc2f5KRq0UnVopOqRZ8sA/InATKpmYBMaiYgk5oJyBtAJjU3QP5kJ1WLTqoWnVQtwh/5DwNyo+YNIE+o+ZudVC06qVp0UrUIf+QFIJOaCcgmNW8AuVHzBJAbNTdAJjUTkE1qvumkatFJ1aKTqkWffJmaGyCTmhsgT6h5AsiNmknNBGQCcqNmAvKGmieATGreOKladFK16KRqEf7IHwzIjZobIDdqJiBvqHkDyI2aCcik5t90UrXopGrRSdWiT14CMqmZgExqboBMaiYgE5BJzY2aCciNmhsgN0AmNU+omYBMap4AMqnZdFK16KRq0UnVIvyRF4BMap4AMqmZgExqJiA3aiYgk5obIG+ouQEyqXkDyI2abzqpWnRSteikahH+yBcBmdS8AeQJNTdAJjU3QCY1E5An1ExA3lAzAZnUTEAmNW+cVC06qVp0UrXok5eATGqeAPKGmgnIDZBJzRNqJiCTmgnIpOZGzQTkm9RsOqladFK16KRq0ScvqXlDzQRkUjMBmYC8AWRSMwGZ1ExqbtRsUjMBuVEzAZnUbDqpWnRSteikahH+yC8CMqm5AfKGmhsgk5obIJOaCcik5gbIpGYTkEnNN51ULTqpWnRStQh/5AUgk5oJyBNqngAyqXkDyBNqboDcqLkBsknNBGRS88ZJ1aKTqkUnVYs++WVqJiA3QCY1k5oJyKRmAjKpeQPIpGZScwPkRs0EZFIzAXlCzaaTqkUnVYtOqhZ98mVqbtTcqLkBcgNkUvOEmhsgN0Bu1NwAmdRMQCY1N0AmNZtOqhadVC06qVr0yS8DMqmZgNyouVEzAZmA3KiZgExqboBMam6APAHkCSA3QCY1b5xULTqpWnRStQh/5D8MyI2aTUAmNTdAnlDzBJBNat44qVp0UrXopGrRJy8B+U1qJjVPALlRc6NmAjKp2QRkUvOGmm86qVp0UrXopGrRJ8vUbAJyA+RGzRtAJjVPqLkBcqPmDTW/6aRq0UnVopOqRZ98GZAn1LyhZgLyhpongExqngDyhpoJyKRmAjKpeeOkatFJ1aKTqkWf/M8AmdRMQJ4AMqmZ1GxS8waQJ9RsOqladFK16KRq0Sd/OTUTkBsgk5oJyI2aJ4A8oeYGyKRm00nVopOqRSdViz75MjXfpOYGyKRmAnKjZgJyo2YCMgF5Qs0EZFIzAZnU/KaTqkUnVYtOqhZ9sgzIbwIyqXlDzRtAbtTcAJnUPKFmAjKp+aaTqkUnVYtOqhbhj1QtOaladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhb9Az/bSxvNMhQhAAAAAElFTkSuQmCC	a4@a.com
10	1	IEIKJI	10	2025-02-09 17:14:20.764368	2025-02-16 16:14:12.173	f	2025-02-09 17:14:20.764368	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAT2SURBVO3BQQokRxDAQKmY/39Z9jFPDUPXLGuTEfYv1rrksNZFh7UuOqx10WGtiw5rXXRY66LDWhcd1rrosNZFh7UuOqx10WGtiw5rXXRY66LDWhd9eEnlT6p4ovJLFZPKVPFEZap4ovInVbxxWOuiw1oXHda66MNlFTepPFF5UvFEZaqYVCaVqeKJyhOVqeJJxU0qNx3Wuuiw1kWHtS768GMq36j4RsWkMql8Q+VJxaQyVXyj4g2Vb1T80mGtiw5rXXRY66IP/3MV31B5ojJVfKPi/+yw1kWHtS46rHXRh/84laniicpUMVVMKk9UpoonKk8q/ssOa110WOuiw1oXffixil+qmFS+ofKkYlJ5ojJVTCpTxRsVf5PDWhcd1rrosNZFHy5T+ZNUpopJZaqYVKaKSWWqmFSmikllqphUpoonKn+zw1oXHda66LDWRfYv/kdUpopvqPxJFf8nh7UuOqx10WGtiz68pDJVTCpTxaQyVUwqU8VNKlPFpPKkYlKZKn5JZap4ojJV3HRY66LDWhcd1rrI/sULKr9UMan8UsWk8o2KN1SeVDxRmSqeqEwVbxzWuuiw1kWHtS768GMVk8pU8URlqvgllaniicobKlPFN1SmiknlTzqsddFhrYsOa11k/+KHVKaKSWWqeKLypOKJypOKb6g8qZhUpopJZap4ovKkYlKZKm46rHXRYa2LDmtd9OEllaniico3VJ5UTCrfqPiGyhsV31CZKqaKSeUbKlPFG4e1LjqsddFhrYs+XKYyVbxR8UTlJpWp4knF30xlqphUbjqsddFhrYsOa1304aWKb6jcVDGpTBVPVKaKSWWq+IbKVDGpPKmYVJ5UPFH5pcNaFx3Wuuiw1kUfXlJ5UvGkYlKZKiaVN1SmiknlicpUMak8UZkqnqg8qZhUpoonFTcd1rrosNZFh7Uu+nBZxZOKSWWqmFSmim+oTBVPKiaVqeIbFd9QeVLxpOIbKlPFG4e1LjqsddFhrYs+vFTxSxWTylTxDZUnFU9UfqliUnlDZaqYVG46rHXRYa2LDmtd9OEllaliUvmGypOKSeUbFZPKpDJV/E1UpopJZaqYVH7psNZFh7UuOqx10YeXKiaVqeKJylTxRsUbFU9UpopJZar4m1XcdFjrosNaFx3WuujDSypTxRsqTyqmiknlScUbFZPKGypvqEwVTyp+6bDWRYe1LjqsddGHlyreqHhDZaqYVJ5UTCpTxZOKSeWNim+oPFH5RsUbh7UuOqx10WGtiz68pPInVUwVk8pU8URlqphUnlRMFZPKGypTxROVqWJS+aXDWhcd1rrosNZFHy6ruEnlDZWpYqqYVJ5UTCq/VPGNiicVv3RY66LDWhcd1rrow4+pfKPiGypTxTdUpopJZVKZKiaVqeKJyqTySypTxU2HtS46rHXRYa2LPvzHVUwqU8Wk8kbFN1S+UfFE5RsqU8UvHda66LDWRYe1LvrwH6dyk8o3VL5R8URlqvgllanijcNaFx3Wuuiw1kUffqzilyp+qWJSmSomlaniicpU8aRiUnlSMalMFTcd1rrosNZFh7Uu+nCZyp+k8o2KSeWJylQxqTxRmSq+ofKk4g2VqeKNw1oXHda66LDWRfYv1rrksNZFh7UuOqx10WGtiw5rXXRY66LDWhcd1rrosNZFh7UuOqx10WGtiw5rXXRY66LDWhf9A3chSVk4dAoVAAAAAElFTkSuQmCC	a6@a.com
9	1	CD5YCM	10	2025-02-09 17:12:48.333181	2025-02-16 16:12:38.443	f	2025-02-09 17:12:48.333181	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATuSURBVO3BQY4bSRAEwfAC//9lXx3zVECjk7MjIczwj1QtOaladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhZ98hKQn6Tmm4DcqJmATGpugExqboD8JDVvnFQtOqladFK16JNlajYBuQEyqZmATGomIJOaCcgEZFJzA+QGyKTmRs0mIJtOqhadVC06qVr0yZcBeULNE2reUDMBuVEzAZnUPKHmDSBPqPmmk6pFJ1WLTqoWffKPAXIDZFLzBJBJzRNq/mUnVYtOqhadVC365C8HZFJzA+RGzQRkE5AbNX+zk6pFJ1WLTqoWffJlar5JzSYgk5oJyATkRs0EZFLzhprf5KRq0UnVopOqRZ8sA/KTgExqJiCTmgnIpGYCMqmZgExqJiCTmgnIpOYGyG92UrXopGrRSdUi/CP/MCA3aiYgT6iZgDyh5l9yUrXopGrRSdWiT14CMqmZgExqJiCTmgnIpOab1ExA3lDzTUAmNTdAJjWbTqoWnVQtOqla9MkyIJOaCcgTaiYgN2r+T2reAHKjZlIzAZnUTGomIJOaN06qFp1ULTqpWvTJS2omIDdqJiA3QCY1N0AmNU8AmdTcAJnUPAFkUvMEkEnNBOQnnVQtOqladFK16JNlaiYgk5on1Dyh5gbIjZobIJOaCcikZgIyqZmATGqeADKpmYBMajadVC06qVp0UrXok5eATGpugNwAeULNE2omID9JzRNAJjWTmgnIE0AmNW+cVC06qVp0UrXok5fUvKFmAjKpuQHyhpoJyKTmBsik5jcBMqmZgGw6qVp0UrXopGoR/pEXgExq3gByo+YJIJOaJ4DcqLkBMqmZgNyomYDcqLkBcqPmjZOqRSdVi06qFn3yw4DcqHkDyA2QSc0E5A0gN0AmNTdAbtRMQCY1N2o2nVQtOqladFK1CP/IC0Bu1NwAmdRMQJ5Q8wSQSc0E5A01TwC5UfMGkBs1b5xULTqpWnRSteiTl9TcAHlDzQ2QJ4BMan4TNROQN4BMaiYgm06qFp1ULTqpWvTJS0AmNTdqboA8oeYGyKRmAnKj5jcBMqmZgExqJiDfdFK16KRq0UnVok9eUjMBmdRMQJ5Q84aaCciNmjeATGp+MzWbTqoWnVQtOqla9MlLQCY1b6iZgExqJiCTmgnIJiCTmjeAvAFkUnOj5ptOqhadVC06qVr0yUtqnlDzhJongNyouQEyqflJap4AcgPkCTVvnFQtOqladFK16JOXgPwkNZOaCcik5gbIpGYC8oSaCcgbQCY1N0AmNROQbzqpWnRSteikatEny9RsAvKEmgnIpOYGyI2aCcg3qXlCzY2abzqpWnRSteikatEnXwbkCTVPANmkZgIyAZnUTEAmNTdAJiDfBGRSs+mkatFJ1aKTqkWf/OXUTECeUDMBuVHzBJAn1NwAeQLIpOabTqoWnVQtOqla9MlfDsiNmhsgk5ongDyh5gbIpOabgExq3jipWnRSteikatEnX6bmm9RMQG6ATGpugNyomYBMam6ATGpu1ExAbtRMQCY1m06qFp1ULTqpWvTJMiA/CcgNkCeA3KiZgNwAmdQ8AeRGzRtAJjVvnFQtOqladFK1CP9I1ZKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0X+bBUZNvXrNPAAAAABJRU5ErkJggg==	a5@a.com
11	1	VSYNJ9	10	2025-02-09 17:16:10.688787	2025-02-16 16:15:34.171	f	2025-02-09 17:16:10.688787	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATNSURBVO3BQW4kSRIEQdNA/f/Lun30UwCJ9OKSAxPBf1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0yUtAfpKaCcikZgJyo2YCMqmZgExqngByo2YC8pPUvHFSteikatFJ1aJPlqnZBOQ3UfMEkEnNG2o2Adl0UrXopGrRSdWiT74MyBNqnlAzAZnUTEAmIJOaJ4BMaiY1N0AmNU8AeULNN51ULTqpWnRSteiTPw7IDZA3gDwBZFIzAZnU/JecVC06qVp0UrXokz9OzQ2QGzVPqLkB8gSQSc1fdlK16KRq0UnVok++TM1PAjKpuQFyo2YCcqPmCTVvqPlNTqoWnVQtOqla9MkyID8JyKRmAjKpuVEzAZnUTEBugExqJiCTmhsgv9lJ1aKTqkUnVYs+eUnNbwLkCTU3am7UTEA2qflLTqoWnVQtOqla9MlLQCY1E5AbNROQJ9TcAJmATGomIJOaCcik5gkgTwCZ1NwAmdRMQG7UvHFSteikatFJ1aJPfhk1TwB5A8gNkEnNBOQNNROQGyA3am7UTEA2nVQtOqladFK16JNlQG7UTEDeUPMGkBs1N2omIDdqJiCTmgnIjZobIDdqNp1ULTqpWnRSteiTl9R8k5obIJOaN9Q8AWRScwNkUvMGkBs1N0AmNW+cVC06qVp0UrUI/8kLQG7UTEAmNROQGzUTkEnNE0AmNROQN9TcAJnUvAHkRs03nVQtOqladFK16JNlap4AcqNmAjKpeQLIpOYJNROQSc0NkCeATGpu1NwAuVHzxknVopOqRSdViz75MiA3aiYgE5BJzQRkUjMBuQFyo2YCMql5Q80EZFIzAZnUTED+n06qFp1ULTqpWoT/5AcBuVFzA2RS8waQSc0E5EbNNwGZ1ExAJjU3QCY1m06qFp1ULTqpWvTJMiCTmhs1E5AbNROQSc0E5EbNE2qeADKpuQEyqZmA/GYnVYtOqhadVC365IepeULNBOQJNZuA3KiZ1HyTmhsgP+mkatFJ1aKTqkWfvARkUjMBmdQ8AeQJIJOaCcgbajYB2QTkRs03nVQtOqladFK16JOX1DwB5EbNT1IzAbkB8oSaCcgTQJ5QMwH5SSdVi06qFp1ULfpkGZBJzRNAbtRsAvJNQL4JyG9yUrXopGrRSdUi/Cd/GJBJzW8C5Ak1TwDZpOaNk6pFJ1WLTqoWffISkJ+k5gbIG2omIG+omYA8AWRS84SaCcikZtNJ1aKTqkUnVYs+WaZmE5A31DwB5Ak1N0DeUPOEmieATGreOKladFK16KRq0SdfBuQJNU+omYC8oeYJIDdqboBMQDYBmdRMQDadVC06qVp0UrXokz8OyA2QJ9TcAJnUTEAmIJOaSc0EZFIzAbkBMqmZgExqNp1ULTqpWnRSteiT/zg1E5AbIDdqJiA3aiYgm9RMQG7UTEAmNW+cVC06qVp0UrXoky9T801qnlAzAZnUTEAmIJOaGyBPqPkmIJOaTSdVi06qFp1ULfpkGZCfBGRS8waQSc0bam6APKFmAjKp+X86qVp0UrXopGoR/pOqJSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWi/wEgjiJcgmTjswAAAABJRU5ErkJggg==	a7@a.com
14	12	OY1DWM	10	2025-02-09 20:23:05.903129	2025-02-16 19:22:57.996	f	2025-02-09 20:23:05.903129	\N	abeljhinestrosa@gmail.com
15	\N	MSWCRM	10	2025-02-09 20:33:00.34518	2025-02-16 19:33:00.334	t	2025-02-09 20:33:00.34518	\N	abeljhinestrosa@gmail.com
16	12	68FUFM	10	2025-02-09 20:35:28.527061	2025-02-16 20:35:21.384	t	2025-02-09 20:35:28.527061	\N	abeljhinestrosa@gmail.com
\.


--
-- Data for Name: descuentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.descuentos (id, negocio_id, codigo, porcentaje, fecha_inicio, fecha_fin, estado, created_at) FROM stdin;
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (id, negocio_id, monto_descuento, monto_ingreso, monto_total, fecha_emision, fecha_pago, estado, canje_id, created_at, fecha_aceptacion) FROM stdin;
3	12	25.00	25.00	50.00	2025-02-09 20:23:27.789438	2025-02-09 20:23:51.565004	pagada	10	2025-02-09 20:23:27.789438	2025-02-09 20:23:45.535739
\.


--
-- Data for Name: facturas_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas_backup (id, negocio_id, monto, concepto, fecha_vencimiento, pagada, fecha_pago, created_at) FROM stdin;
\.


--
-- Data for Name: formularios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formularios (id, negocio_id, nombre, email, telefono, mensaje, atendido, created_at) FROM stdin;
2	12	jose2	abeljhinestrosa@gmail.com	123	a	t	2025-02-09 20:31:08.088348
1	\N	jose	abeljhinestrosa@gmail.com	123456789	Quiero el descuento.	t	2025-02-09 20:27:15.147736
\.


--
-- Data for Name: negocios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.negocios (id, nombre, email, telefono, usuario, password, codigo_qr, estado, role, created_at) FROM stdin;
1	test	test	test	test	$2a$10$ikAtCoKXflTq21D1Fw5ex.lJPnmR3BoOdK50cZWMY.ZEnrL2xYk5i	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATsSURBVO3BQY4bSRAEwfAC//9l3znmqYBGJ7UaIczwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIn6TmCSCTmgnIjZobIJOaCciNmhsgf5KaN06qFp1ULTqpWvTJMjWbgNwAuVEzAblRMwH5JiCTmhs1m4BsOqladFK16KRq0SdfBuQJNU+ouQEyqbkBcqNmAvKGmjeAPKHmm06qFp1ULTqpWvTJPwbIDZBJzRNAJjVPqPmXnVQtOqladFK16JNfDsikZgLyhJoJyKTmBsgNkBs1v9lJ1aKTqkUnVYs++TI136RmAjKpmYBMQG7UPKFmAnKj5g01f5OTqkUnVYtOqhZ9sgzInwRkUjMBmdRMQCY1E5BJzQRkUnOjZgIyqbkB8jc7qVp0UrXopGoR/sg/BMik5gkgN2omIG+o+ZecVC06qVp0UrXok5eATGomIJOaCcikZgIyqXkDyI2aCcgEZFIzAZnUfBOQSc0NkEnNppOqRSdVi06qFn3ykpongDyh5gbIpGYCcqPmm4BMam6A3KiZ1ExAJjWTmgnIpOaNk6pFJ1WLTqoWfbIMyKTmCSBPqJmA3Ki5ATKp+SYgk5ongExqJiB/0knVopOqRSdViz75MiCTmifU3AB5AsikZlJzA2RSc6NmAjKpmYBMap4AMqmZgExqNp1ULTqpWnRSteiTZWpugExqboA8oeYGyBtqJiBPqHkCyKRmUjMBeQLIpOaNk6pFJ1WLTqoWfbIMyKRmUvOEmgnIDZA3gExqJiA3av4mQCY1E5BNJ1WLTqoWnVQt+mSZmgnIG0AmNROQJ9TcqJmAfBOQGzUTkBs1N0C+6aRq0UnVopOqRfgjLwCZ1PzNgLyhZgLyhpobIDdqJiCTmgnIpGbTSdWik6pFJ1WL8EdeAHKjZgKySc0NkCfUTEBu1ExAbtTcALlR8waQGzVvnFQtOqladFK16JOX1ExAJiA3aiYgk5oJyCY1m9S8oWYC8gaQSc0EZNNJ1aKTqkUnVYs+eQnIpOYJIJOaCcgTQCY1N0Bu1DwBZFKzCcikZgIyqZmAfNNJ1aKTqkUnVYs+eUnNBGSTmhsgTwC5UXMDZFJzA2RS8zdRs+mkatFJ1aKTqkX4Iy8AmdRMQCY1E5BJzQRkUnMD5EbNJiBPqJmAbFLzfzqpWnRSteikahH+yC8G5JvUTEDeUDMBmdQ8AWRSMwF5Qs0bJ1WLTqoWnVQt+uQlIH+SmknNBGRScwNkUjMBeULNBGQC8gSQSc0NkEnNBOSbTqoWnVQtOqla9MkyNZuAbAJyA+RGzQRkArJJzRNqnlCz6aRq0UnVopOqRZ98GZAn1DwBZJOaCcgEZFJzA2RSMwGZgPxmJ1WLTqoWnVQt+uSXU3MDZFIzAfkmNROQGzU3QJ4AMqn5ppOqRSdVi06qFn3yywF5AsgNkBs1N0AmNZOaGyCTmm8CMql546Rq0UnVopOqRZ98mZpvUnMD5EbNBGRSMwGZ1ExqngAyqblRMwG5UTMBmdRsOqladFK16KRq0SfLgPxJQG7UTEAmIDdAJjUTkEnNJiA3at4AMql546Rq0UnVopOqRfgjVUtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRf8BR3U/XXR5q3oAAAAASUVORK5CYII=	t	business	2025-02-09 16:39:29.479135
12	abel	abeljhinestrosa@gmail.com	123456789	abel	$2a$10$IVUQO39lAT0IalaAA80LMustd4v7bZLRizNp5tWbeMPHxrSSxnYrW	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATCSURBVO3BQW4kSRIEQdNA/f/Lujz6KYBEenGaCxPBH6laclK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC365CUgv0nNBOQJNROQSc0NkBs1E5An1ExAfpOaN06qFp1ULTqpWvTJMjWbgLyh5g0gN2qeUPOGmk1ANp1ULTqpWnRSteiTLwPyhJon1GwCsknNDZBJzRNAnlDzTSdVi06qFp1ULfrkjwNyo2YCMql5A8iNmgnIpOb/yUnVopOqRSdViz7549RMQCYgk5oJyI2aGzVvAJnU/GUnVYtOqhadVC365MvU/CVqJiCTmhsgT6h5Q82/5KRq0UnVopOqRZ8sA/KbgExqJiDfBGRSMwGZ1ExAJjU3QP5lJ1WLTqoWnVQt+uQlNX+ZmgnIE2omIJvU/CUnVYtOqhadVC365CUgk5oJyI2aCcgTam7UTEA2AXkCyBNAJjU3QCY1E5AbNW+cVC06qVp0UrXoky9TcwNkUnMDZALyhpongNyouQEyqZmA3AC5UXOjZgKy6aRq0UnVopOqRZ+8pGYCcqPmCSCb1ExAJjUTkBs1T6iZgExqJiA3am6A3KjZdFK16KRq0UnVIvyRF4BMaiYgN2qeAHKjZgJyo2YC8oSaJ4BMam6AvKHmBsik5o2TqkUnVYtOqhbhj7wAZFLzBJA31LwBZFLzBJAbNTdAJjVvALlR800nVYtOqhadVC3CH1kE5Ak1E5BJzQRkk5oJyKRmE5AbNROQSc0bQG7UvHFSteikatFJ1aJPXgIyqZmATGpu1ExAJjU3QJ4AMqmZgExqngByo2YCMqmZgExqJiD/pZOqRSdVi06qFuGP/CIgT6h5AsikZgIyqZmATGomIJOabwIyqZmATGpugExqNp1ULTqpWnRSteiTX6ZmAjKpmYBMaiYgk5oJyBNqbtR8E5BJzQTkX3ZSteikatFJ1aJPlgGZ1NyouVGzSc0NkEnNE0AmNd+k5gbIbzqpWnRSteikatEnLwGZ1GwCcqNmAvIEkEnNbwKyCciNmm86qVp0UrXopGoR/sgXAXlDzQRkUnMDZFLzBpB/iZobIJOabzqpWnRSteikatEny4BMaiYgTwCZ1ExA3gByo+ZGzQRkUjMB2QTkX3JSteikatFJ1SL8kT8MyH9JzRNAbtQ8AWSTmjdOqhadVC06qVr0yUtAfpOaGzVvAJnU3AC5UfMGkEnNE2omIJOaTSdVi06qFp1ULfpkmZpNQJ4AMqmZgExqJjVvqJmAvKHmCTVPAJnUvHFSteikatFJ1aJPvgzIE2qeUDMBeQLIpGYCcqNmAnKjZgIyAdkEZFIzAdl0UrXopGrRSdWiT/44IJOaJ9Q8oWYC8oaaCcikZgJyA2RSMwGZ1Gw6qVp0UrXopGrRJ3WlZgLyhJoJyCY1E5AbNROQSc0bJ1WLTqoWnVQt+uTL1HyTmhsgTwCZ1ExqJiCTmgnIE2q+CcikZtNJ1aKTqkUnVYs+WQbkNwGZ1DwB5AbIjZoJyKTmBsgTaiYgk5r/0knVopOqRSdVi/BHqpacVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi/4HogwuOEuGugMAAAAASUVORK5CYII=	t	business	2025-02-09 20:22:28.131477
\.


--
-- Data for Name: redenciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redenciones (id, descuento_id, usuario_id, fecha_redencion, estado) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password, role, estado, created_at, usuario) FROM stdin;
3	Administrador	admin@admin.com	$2a$10$x6ZmBpD0Vjj3o5S21QlTXe435mNAuGs4g8tWVI23a1/7bzvN4yGDG	admin	t	2025-02-09 16:37:11.217078	admin
12	abel	abeljhinestrosa@gmail.com	$2a$10$IVUQO39lAT0IalaAA80LMustd4v7bZLRizNp5tWbeMPHxrSSxnYrW	business	t	2025-02-09 20:22:28.131477	abel
\.


--
-- Name: canjes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canjes_id_seq', 10, true);


--
-- Name: codigos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.codigos_id_seq', 16, true);


--
-- Name: descuentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.descuentos_id_seq', 1, false);


--
-- Name: facturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_id_seq', 3, true);


--
-- Name: formularios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formularios_id_seq', 2, true);


--
-- Name: negocios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.negocios_id_seq', 5, true);


--
-- Name: redenciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.redenciones_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 12, true);


--
-- Name: canjes canjes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canjes
    ADD CONSTRAINT canjes_pkey PRIMARY KEY (id);


--
-- Name: codigos codigos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos
    ADD CONSTRAINT codigos_codigo_key UNIQUE (codigo);


--
-- Name: codigos codigos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos
    ADD CONSTRAINT codigos_pkey PRIMARY KEY (id);


--
-- Name: descuentos descuentos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos
    ADD CONSTRAINT descuentos_codigo_key UNIQUE (codigo);


--
-- Name: descuentos descuentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos
    ADD CONSTRAINT descuentos_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: formularios formularios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formularios
    ADD CONSTRAINT formularios_pkey PRIMARY KEY (id);


--
-- Name: negocios negocios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.negocios
    ADD CONSTRAINT negocios_email_key UNIQUE (email);


--
-- Name: negocios negocios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.negocios
    ADD CONSTRAINT negocios_pkey PRIMARY KEY (id);


--
-- Name: negocios negocios_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.negocios
    ADD CONSTRAINT negocios_usuario_key UNIQUE (usuario);


--
-- Name: redenciones redenciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redenciones
    ADD CONSTRAINT redenciones_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_usuario_key UNIQUE (usuario);


--
-- Name: idx_descuentos_negocio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_descuentos_negocio ON public.descuentos USING btree (negocio_id);


--
-- Name: idx_facturas_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facturas_estado ON public.facturas USING btree (estado);


--
-- Name: idx_facturas_fecha_emision; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facturas_fecha_emision ON public.facturas USING btree (fecha_emision);


--
-- Name: idx_facturas_negocio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facturas_negocio ON public.facturas USING btree (negocio_id);


--
-- Name: idx_formularios_negocio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_formularios_negocio ON public.formularios USING btree (negocio_id);


--
-- Name: idx_negocios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_negocios_email ON public.negocios USING btree (email);


--
-- Name: idx_redenciones_descuento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redenciones_descuento ON public.redenciones USING btree (descuento_id);


--
-- Name: idx_redenciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redenciones_usuario ON public.redenciones USING btree (usuario_id);


--
-- Name: facturas trigger_actualizar_monto_total; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_monto_total BEFORE INSERT OR UPDATE ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.actualizar_monto_total();


--
-- Name: canjes canjes_codigo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canjes
    ADD CONSTRAINT canjes_codigo_id_fkey FOREIGN KEY (codigo_id) REFERENCES public.codigos(id);


--
-- Name: canjes canjes_negocio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canjes
    ADD CONSTRAINT canjes_negocio_id_fkey FOREIGN KEY (negocio_id) REFERENCES public.negocios(id);


--
-- Name: codigos codigos_negocio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos
    ADD CONSTRAINT codigos_negocio_id_fkey FOREIGN KEY (negocio_id) REFERENCES public.negocios(id);


--
-- Name: descuentos descuentos_negocio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos
    ADD CONSTRAINT descuentos_negocio_id_fkey FOREIGN KEY (negocio_id) REFERENCES public.negocios(id);


--
-- Name: facturas facturas_canje_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_canje_id_fkey FOREIGN KEY (canje_id) REFERENCES public.canjes(id);


--
-- Name: facturas facturas_negocio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_negocio_id_fkey FOREIGN KEY (negocio_id) REFERENCES public.negocios(id);


--
-- Name: formularios formularios_negocio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formularios
    ADD CONSTRAINT formularios_negocio_id_fkey FOREIGN KEY (negocio_id) REFERENCES public.negocios(id);


--
-- Name: redenciones redenciones_descuento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redenciones
    ADD CONSTRAINT redenciones_descuento_id_fkey FOREIGN KEY (descuento_id) REFERENCES public.descuentos(id);


--
-- Name: redenciones redenciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redenciones
    ADD CONSTRAINT redenciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--

