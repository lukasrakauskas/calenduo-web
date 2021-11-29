/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  email: string;
  password: string;
  roles: ("user" | "admin")[];
  teams: Team[];
  id: number;

  /** @format date-time */
  createdAt: string;

  /** @format date-time */
  updatedAt: string;
}

export interface Review {
  title: string;
  description: string;
  rating: number;
  jobId: number;
  job: Job;
  id: number;

  /** @format date-time */
  createdAt: string;

  /** @format date-time */
  updatedAt: string;
}

export interface Job {
  title: string;
  description: string;
  hourlyRate: number;
  teamId: number;
  team: Team;
  reviews: Review[];
  id: number;

  /** @format date-time */
  createdAt: string;

  /** @format date-time */
  updatedAt: string;
}

export interface Team {
  name: string;
  slug: string;
  ownerId: number;
  owner: User;
  members: User[];
  jobs: Job[];
  id: number;

  /** @format date-time */
  createdAt: string;

  /** @format date-time */
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AccessTokenDto {
  accessToken: string;
}

export interface CreateTeamDto {
  name: string;
  slug: string;
}

export interface Exception {
  statusCode: number;
  message: string;
}

export interface UpdateTeamDto {
  name?: string;
  slug?: string;
}

export interface CreateJobDto {
  title: string;
  description: string;

  /** @min 0 */
  hourlyRate: number;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;

  /** @min 0 */
  hourlyRate?: number;
}

export interface CreateReviewDto {
  title: string;
  description: string;

  /**
   * @min 1
   * @max 5
   */
  rating: number;
}

export interface UpdateReviewDto {
  title?: string;
  description?: string;

  /**
   * @min 1
   * @max 5
   */
  rating?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:5000";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Calenduo
 * @version 1.0
 * @baseUrl http://localhost:5000
 * @contact
 *
 * Calenduo API
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name GetHello
   * @request GET:/
   */
  getHello = (params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/`,
      method: "GET",
      format: "json",
      ...params,
    });

  users = {
    /**
     * No description
     *
     * @tags users
     * @name GetUsers
     * @request GET:/users
     */
    getUsers: (params: RequestParams = {}) =>
      this.request<User[], any>({
        path: `/users`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name CreateUser
     * @request POST:/users
     */
    createUser: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name FindUserById
     * @request GET:/users/{id}
     */
    findUserById: (id: number, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags auth
     * @name Login
     * @request POST:/auth/login
     */
    login: (data: LoginDto, params: RequestParams = {}) =>
      this.request<AccessTokenDto, { statusCode: number; message: string; error?: string }>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name Me
     * @request GET:/auth/me
     * @secure
     */
    me: (params: RequestParams = {}) =>
      this.request<User, { statusCode: number; message: string; error?: string }>({
        path: `/auth/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  teams = {
    /**
     * No description
     *
     * @tags teams
     * @name CreateTeam
     * @request POST:/teams
     * @secure
     */
    createTeam: (data: CreateTeamDto, params: RequestParams = {}) =>
      this.request<Team, Exception>({
        path: `/teams`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name FindAllTeams
     * @request GET:/teams
     * @secure
     */
    findAllTeams: (params: RequestParams = {}) =>
      this.request<Team[], any>({
        path: `/teams`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name FindTeamById
     * @request GET:/teams/{id}
     * @secure
     */
    findTeamById: (id: number, params: RequestParams = {}) =>
      this.request<Team, any>({
        path: `/teams/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name UpdateTeam
     * @request PATCH:/teams/{id}
     * @secure
     */
    updateTeam: (id: number, data: UpdateTeamDto, params: RequestParams = {}) =>
      this.request<Team, any>({
        path: `/teams/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name DeleteTeam
     * @request DELETE:/teams/{id}
     * @secure
     */
    deleteTeam: (id: number, params: RequestParams = {}) =>
      this.request<Team, any>({
        path: `/teams/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-jobs
     * @name Create
     * @request POST:/teams/{teamId}/jobs
     * @secure
     */
    create: (teamId: number, data: CreateJobDto, params: RequestParams = {}) =>
      this.request<Job, any>({
        path: `/teams/${teamId}/jobs`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-jobs
     * @name FindAll
     * @request GET:/teams/{teamId}/jobs
     * @secure
     */
    findAll: (teamId: number, params: RequestParams = {}) =>
      this.request<Job[], any>({
        path: `/teams/${teamId}/jobs`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-jobs
     * @name FindOne
     * @request GET:/teams/{teamId}/jobs/{id}
     * @secure
     */
    findOne: (id: number, teamId: number, params: RequestParams = {}) =>
      this.request<Job, any>({
        path: `/teams/${teamId}/jobs/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-jobs
     * @name Update
     * @request PATCH:/teams/{teamId}/jobs/{id}
     * @secure
     */
    update: (id: number, teamId: number, data: UpdateJobDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/${teamId}/jobs/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-jobs
     * @name Remove
     * @request DELETE:/teams/{teamId}/jobs/{id}
     * @secure
     */
    remove: (id: number, teamId: number, params: RequestParams = {}) =>
      this.request<Job, any>({
        path: `/teams/${teamId}/jobs/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-job-reviews
     * @name CreateReview
     * @request POST:/teams/{teamId}/jobs/{jobId}/reviews
     * @secure
     */
    createReview: (teamId: number, jobId: number, data: CreateReviewDto, params: RequestParams = {}) =>
      this.request<Review, any>({
        path: `/teams/${teamId}/jobs/${jobId}/reviews`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-job-reviews
     * @name FindAllReviews
     * @request GET:/teams/{teamId}/jobs/{jobId}/reviews
     * @secure
     */
    findAllReviews: (teamId: number, jobId: number, params: RequestParams = {}) =>
      this.request<Review[], any>({
        path: `/teams/${teamId}/jobs/${jobId}/reviews`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-job-reviews
     * @name FindReviewById
     * @request GET:/teams/{teamId}/jobs/{jobId}/reviews/{id}
     * @secure
     */
    findReviewById: (id: number, teamId: number, jobId: number, params: RequestParams = {}) =>
      this.request<Review, any>({
        path: `/teams/${teamId}/jobs/${jobId}/reviews/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-job-reviews
     * @name UpdateReview
     * @request PATCH:/teams/{teamId}/jobs/{jobId}/reviews/{id}
     * @secure
     */
    updateReview: (id: number, teamId: number, jobId: number, data: UpdateReviewDto, params: RequestParams = {}) =>
      this.request<Review, any>({
        path: `/teams/${teamId}/jobs/${jobId}/reviews/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags team-job-reviews
     * @name DeleteReview
     * @request DELETE:/teams/{teamId}/jobs/{jobId}/reviews/{id}
     * @secure
     */
    deleteReview: (id: number, teamId: number, jobId: number, params: RequestParams = {}) =>
      this.request<Review, { statusCode: number; message: string; error?: string }>({
        path: `/teams/${teamId}/jobs/${jobId}/reviews/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
