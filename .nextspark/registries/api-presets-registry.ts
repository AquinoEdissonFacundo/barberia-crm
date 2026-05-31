/**
 * Auto-generated API Presets Registry
 *
 * Generated at: 2026-05-31T16:00:45.261Z
 * Theme: barbercrm
 * Total endpoints: 17
 * Total presets: 95
 *
 * DO NOT EDIT - This file is auto-generated
 */

import type { ApiPresetsRegistryStructure, ApiEndpointPresets, ApiPreset } from '@nextsparkjs/core/types/api-presets'

// Re-export types
export type { ApiPresetsRegistryStructure, ApiEndpointPresets, ApiPreset }

export const API_PRESETS_REGISTRY: ApiPresetsRegistryStructure = {
  endpoints: {
  '/api/v1/pages': {
    endpoint: '/api/v1/pages',
    summary: 'Manage builder-enabled pages',
    sourcePath: 'contents/themes/barbercrm/entities/pages/api/presets.ts',
    source: 'entity',
    presets: [
      {
        id: 'list-all',
        title: 'List All Pages',
        method: 'GET',
        description: 'Fetch all pages with default pagination',
        params: {"limit":10,"offset":0},
        tags: ['read', 'list'],
      },
      {
        id: 'list-published',
        title: 'List Published Pages',
        method: 'GET',
        description: 'Fetch only published pages',
        params: {"status":"published","limit":20},
        tags: ['read', 'filter'],
      },
      {
        id: 'list-by-locale',
        title: 'List Spanish Pages',
        method: 'GET',
        description: 'Fetch pages in Spanish locale',
        params: {"locale":"es","limit":10},
        tags: ['read', 'filter', 'i18n'],
      },
      {
        id: 'create-draft',
        title: 'Create Draft Page',
        method: 'POST',
        description: 'Create a new page as draft',
        payload: {
          "title": "New Page",
          "slug": "new-page",
          "status": "draft",
          "locale": "en",
          "blocks": []
        },
        tags: ['write', 'create'],
      },
      {
        id: 'search-title',
        title: 'Search by Title',
        method: 'GET',
        description: 'Search pages by title',
        params: {"search":"About","searchField":"title"},
        tags: ['read', 'search'],
      }
    ]
  },
  '/api/v1/posts': {
    endpoint: '/api/v1/posts',
    summary: 'Manage blog posts with builder and taxonomies',
    sourcePath: 'contents/themes/barbercrm/entities/posts/api/presets.ts',
    source: 'entity',
    presets: [
      {
        id: 'list-all',
        title: 'List All Posts',
        method: 'GET',
        description: 'Fetch all posts with default pagination',
        params: {"limit":10,"offset":0},
        tags: ['read', 'list'],
      },
      {
        id: 'list-published',
        title: 'List Published Posts',
        method: 'GET',
        description: 'Fetch only published posts',
        params: {"status":"published","limit":20,"sortBy":"createdAt","sortOrder":"desc"},
        tags: ['read', 'filter', 'public'],
      },
      {
        id: 'list-drafts',
        title: 'List Draft Posts',
        method: 'GET',
        description: 'Fetch posts in draft status',
        params: {"status":"draft","limit":20},
        tags: ['read', 'filter'],
      },
      {
        id: 'create-draft',
        title: 'Create Draft Post',
        method: 'POST',
        description: 'Create a new post as draft',
        payload: {
          "title": "My New Blog Post",
          "slug": "my-new-blog-post",
          "status": "draft",
          "excerpt": "A brief introduction to my post",
          "blocks": []
        },
        tags: ['write', 'create'],
      },
      {
        id: 'search-title',
        title: 'Search by Title',
        method: 'GET',
        description: 'Search posts by title',
        params: {"search":"NextSpark","searchField":"title"},
        tags: ['read', 'search'],
      }
    ]
  },
  '/api/v1/tasks': {
    endpoint: '/api/v1/tasks',
    summary: 'Manage tasks with status and priorities',
    sourcePath: 'contents/themes/barbercrm/entities/tasks/api/presets.ts',
    source: 'entity',
    presets: [
      {
        id: 'list-all',
        title: 'List All Tasks',
        method: 'GET',
        description: 'Fetch all tasks with default pagination',
        params: {"limit":10,"offset":0},
        tags: ['read', 'list'],
      },
      {
        id: 'list-todo',
        title: 'List To-Do Tasks',
        method: 'GET',
        description: 'Fetch tasks in to-do status',
        params: {"status":"todo","limit":20},
        tags: ['read', 'filter'],
      },
      {
        id: 'list-in-progress',
        title: 'List In Progress',
        method: 'GET',
        description: 'Fetch tasks currently in progress',
        params: {"status":"in-progress","limit":20},
        tags: ['read', 'filter'],
      },
      {
        id: 'list-urgent',
        title: 'List Urgent Tasks',
        method: 'GET',
        description: 'Fetch high priority and urgent tasks',
        params: {"priority":"urgent","sortBy":"dueDate","sortOrder":"asc"},
        tags: ['read', 'filter', 'priority'],
      },
      {
        id: 'create-task',
        title: 'Create New Task',
        method: 'POST',
        description: 'Create a new task with sample data',
        tags: ['development'],
      },
      {
        id: 'search-title',
        title: 'Search by Title',
        method: 'GET',
        description: 'Search tasks by title',
        params: {"search":"feature","searchField":"title"},
        tags: ['read', 'search'],
      }
    ]
  },
  '/api/v1/api-keys': {
    endpoint: '/api/v1/api-keys',
    summary: 'Manage API keys for programmatic access',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/api-keys/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-all',
        title: 'List API Keys',
        method: 'GET',
        description: 'Fetch all API keys for the current team',
        tags: ['read', 'list'],
      },
      {
        id: 'create-key',
        title: 'Create API Key',
        method: 'POST',
        description: 'Create a new API key for the team',
        payload: {
          "name": "My New API Key"
        },
        tags: ['write', 'create'],
      }
    ]
  },
  '/api/v1/auth': {
    endpoint: '/api/v1/auth',
    summary: 'Authentication with Better Auth and NextSpark extensions',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/auth/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'signup-with-invite',
        title: 'Sign Up with Invitation',
        method: 'POST',
        description: 'Create account and join team via invitation token',
        payload: {
          "email": "newuser@example.com",
          "password": "Test1234",
          "firstName": "John",
          "lastName": "Doe",
          "inviteToken": "invitation_token_here"
        },
        tags: ['write', 'signup'],
      },
      {
        id: 'signup-with-invite-minimal',
        title: 'Sign Up (Minimal)',
        method: 'POST',
        description: 'Sign up with only required fields',
        payload: {
          "email": "user@example.com",
          "password": "SecurePass123",
          "inviteToken": "invitation_token_here"
        },
        tags: ['write', 'signup'],
      }
    ]
  },
  '/api/v1/billing': {
    endpoint: '/api/v1/billing',
    summary: 'Manage subscriptions, plans, and billing operations',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/billing/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-plans',
        title: 'List Plans',
        method: 'GET',
        description: 'Fetch all available subscription plans',
        tags: ['read', 'plans'],
      },
      {
        id: 'checkout-pro-monthly',
        title: 'Checkout Pro (Monthly)',
        method: 'POST',
        description: 'Create checkout session for Pro plan monthly',
        payload: {
          "planSlug": "pro",
          "billingPeriod": "monthly"
        },
        tags: ['write', 'checkout'],
      },
      {
        id: 'checkout-pro-yearly',
        title: 'Checkout Pro (Yearly)',
        method: 'POST',
        description: 'Create checkout session for Pro plan yearly (save 20%)',
        payload: {
          "planSlug": "pro",
          "billingPeriod": "yearly"
        },
        tags: ['write', 'checkout'],
      },
      {
        id: 'checkout-enterprise',
        title: 'Checkout Enterprise',
        method: 'POST',
        description: 'Create checkout session for Enterprise plan',
        payload: {
          "planSlug": "enterprise",
          "billingPeriod": "yearly"
        },
        tags: ['write', 'checkout'],
      },
      {
        id: 'open-portal',
        title: 'Open Customer Portal',
        method: 'GET',
        description: 'Get URL for billing management portal',
        tags: ['read', 'portal'],
      },
      {
        id: 'upgrade-to-pro',
        title: 'Upgrade to Pro',
        method: 'POST',
        description: 'Change current subscription to Pro plan',
        payload: {
          "planSlug": "pro",
          "billingPeriod": "monthly"
        },
        tags: ['write', 'change-plan'],
      },
      {
        id: 'cancel-subscription',
        title: 'Cancel Subscription',
        method: 'POST',
        description: 'Cancel current subscription at end of billing period',
        tags: ['write', 'cancel'],
      },
      {
        id: 'check-invite-member',
        title: 'Check: Can Invite Member',
        method: 'POST',
        description: 'Check if team can invite more members (quota check)',
        payload: {
          "action": "team.invite_member"
        },
        tags: ['read', 'check-action'],
      },
      {
        id: 'check-create-project',
        title: 'Check: Can Create Project',
        method: 'POST',
        description: 'Check if team can create more projects',
        payload: {
          "action": "projects.create"
        },
        tags: ['read', 'check-action'],
      },
      {
        id: 'check-api-access',
        title: 'Check: API Access',
        method: 'POST',
        description: 'Check if plan includes API access feature',
        payload: {
          "action": "api.access"
        },
        tags: ['read', 'check-action'],
      }
    ]
  },
  '/api/v1/blocks': {
    endpoint: '/api/v1/blocks',
    summary: 'Access and validate page builder blocks',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/blocks/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-all',
        title: 'List All Blocks',
        method: 'GET',
        description: 'Fetch all registered blocks with metadata',
        tags: ['read', 'list'],
      },
      {
        id: 'list-hero-blocks',
        title: 'List Hero Blocks',
        method: 'GET',
        description: 'Filter blocks by hero category',
        tags: ['read', 'list', 'filter'],
      },
      {
        id: 'list-content-blocks',
        title: 'List Content Blocks',
        method: 'GET',
        description: 'Filter blocks by content category',
        tags: ['read', 'list', 'filter'],
      },
      {
        id: 'list-page-blocks',
        title: 'List Page Blocks',
        method: 'GET',
        description: 'Filter blocks available for pages',
        tags: ['read', 'list', 'filter'],
      },
      {
        id: 'get-hero-simple',
        title: 'Get Hero Simple',
        method: 'GET',
        description: 'Fetch hero-simple block metadata',
        tags: ['read', 'single'],
      },
      {
        id: 'get-faq-accordion',
        title: 'Get FAQ Accordion',
        method: 'GET',
        description: 'Fetch faq-accordion block metadata',
        tags: ['read', 'single'],
      },
      {
        id: 'validate-hero',
        title: 'Validate Hero Props',
        method: 'POST',
        description: 'Validate hero block properties',
        payload: {
          "blockSlug": "hero-simple",
          "props": {
            "title": "Welcome to Our Site",
            "subtitle": "Discover amazing features"
          }
        },
        tags: ['write', 'validate'],
      },
      {
        id: 'validate-faq',
        title: 'Validate FAQ Props',
        method: 'POST',
        description: 'Validate FAQ block with items',
        payload: {
          "blockSlug": "faq-accordion",
          "props": {
            "title": "Frequently Asked Questions",
            "items": [
              {
                "question": "How does it work?",
                "answer": "It works seamlessly with your existing workflow."
              }
            ]
          }
        },
        tags: ['write', 'validate'],
      },
      {
        id: 'validate-invalid',
        title: 'Validate Invalid Props',
        method: 'POST',
        description: 'Test validation error response (missing required field)',
        payload: {
          "blockSlug": "hero-simple",
          "props": {
            "subtitle": "Missing required title field"
          }
        },
        tags: ['write', 'validate', 'error'],
      }
    ]
  },
  '/api/v1/cron': {
    endpoint: '/api/v1/cron',
    summary: 'Process scheduled actions via cron',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/cron/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'process-actions',
        title: 'Process Scheduled Actions',
        method: 'GET',
        description: 'Process pending actions (requires CRON_SECRET header)',
        tags: ['write', 'cron'],
      }
    ]
  },
  '/api/v1/devtools': {
    endpoint: '/api/v1/devtools',
    summary: 'Development and debugging utilities',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/devtools/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'get-teams-docs',
        title: 'Get Teams Docs',
        method: 'GET',
        description: 'Fetch Teams API documentation',
        tags: ['read', 'docs'],
      },
      {
        id: 'get-billing-docs',
        title: 'Get Billing Docs',
        method: 'GET',
        description: 'Fetch Billing API documentation',
        tags: ['read', 'docs'],
      },
      {
        id: 'list-features',
        title: 'List Features',
        method: 'GET',
        description: 'Get feature registry with test coverage',
        tags: ['read', 'testing'],
      },
      {
        id: 'list-devtools-blocks',
        title: 'List Blocks Metadata',
        method: 'GET',
        description: 'Get block registry metadata',
        tags: ['read', 'blocks'],
      },
      {
        id: 'list-flows',
        title: 'List Test Flows',
        method: 'GET',
        description: 'Get available test flows',
        tags: ['read', 'testing'],
      },
      {
        id: 'list-scheduled-actions',
        title: 'List Scheduled Actions',
        method: 'GET',
        description: 'Get all scheduled actions',
        tags: ['read', 'scheduled-actions'],
      },
      {
        id: 'list-pending-actions',
        title: 'List Pending Actions',
        method: 'GET',
        description: 'Filter scheduled actions by pending status',
        tags: ['read', 'scheduled-actions', 'filter'],
      },
      {
        id: 'list-failed-actions',
        title: 'List Failed Actions',
        method: 'GET',
        description: 'Filter scheduled actions by failed status',
        tags: ['read', 'scheduled-actions', 'filter'],
      },
      {
        id: 'get-testing-info',
        title: 'Get Testing Info',
        method: 'GET',
        description: 'Get testing configuration and utilities',
        tags: ['read', 'testing'],
      }
    ]
  },
  '/api/v1/media': {
    endpoint: '/api/v1/media',
    summary: 'Upload and manage media files',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/media/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'get-upload-info',
        title: 'Get Upload Info',
        method: 'GET',
        description: 'Get media upload endpoint configuration',
        tags: ['read', 'info'],
      }
    ]
  },
  '/api/v1/plugin': {
    endpoint: '/api/v1/plugin',
    summary: 'Access plugin metadata and API routes',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/plugin/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-plugins',
        title: 'List All Plugins',
        method: 'GET',
        description: 'Get all registered plugins with API status',
        tags: ['read', 'list'],
      }
    ]
  },
  '/api/v1/post-categories': {
    endpoint: '/api/v1/post-categories',
    summary: 'Manage blog post categories (taxonomies)',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/post-categories/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-all',
        title: 'List All Categories',
        method: 'GET',
        description: 'Fetch all active post categories',
        tags: ['read', 'list'],
      },
      {
        id: 'create-category',
        title: 'Create Category',
        method: 'POST',
        description: 'Create a new post category',
        payload: {
          "name": "Technology",
          "description": "Tech news and tutorials",
          "icon": "Cpu",
          "color": "#3b82f6",
          "order": 1
        },
        tags: ['write', 'create'],
      },
      {
        id: 'create-category-with-slug',
        title: 'Create with Custom Slug',
        method: 'POST',
        description: 'Create category with explicit slug',
        payload: {
          "name": "Web Development",
          "slug": "web-dev",
          "description": "Web development tutorials and tips",
          "order": 2
        },
        tags: ['write', 'create'],
      },
      {
        id: 'create-subcategory',
        title: 'Create Subcategory',
        method: 'POST',
        description: 'Create child category with parent',
        payload: {
          "name": "JavaScript",
          "slug": "javascript",
          "parentId": "parent_category_id_here",
          "description": "JavaScript tutorials",
          "order": 1
        },
        tags: ['write', 'create', 'hierarchy'],
      },
      {
        id: 'create-default-category',
        title: 'Create Default Category',
        method: 'POST',
        description: 'Create category marked as default',
        payload: {
          "name": "Uncategorized",
          "slug": "uncategorized",
          "isDefault": true,
          "order": 999
        },
        tags: ['write', 'create'],
      }
    ]
  },
  '/api/v1/team-invitations': {
    endpoint: '/api/v1/team-invitations',
    summary: 'Manage team invitations for new members',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/team-invitations/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-pending',
        title: 'List Pending Invitations',
        method: 'GET',
        description: 'Fetch all pending invitations for the team',
        tags: ['read', 'list'],
      },
      {
        id: 'invite-member',
        title: 'Invite as Member',
        method: 'POST',
        description: 'Send invitation with member role',
        payload: {
          "email": "newuser@example.com",
          "role": "member"
        },
        tags: ['write', 'create', 'invite'],
      },
      {
        id: 'invite-admin',
        title: 'Invite as Admin',
        method: 'POST',
        description: 'Send invitation with admin role',
        payload: {
          "email": "admin@example.com",
          "role": "admin"
        },
        tags: ['write', 'create', 'invite', 'admin'],
      }
    ]
  },
  '/api/v1/teams': {
    endpoint: '/api/v1/teams',
    summary: 'Manage teams, members, subscriptions, and multi-tenancy',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/teams/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-all',
        title: 'List My Teams',
        method: 'GET',
        description: 'Fetch all teams the current user belongs to',
        tags: ['read', 'list'],
      },
      {
        id: 'create-team',
        title: 'Create New Team',
        method: 'POST',
        description: 'Create a new team (user becomes owner)',
        payload: {
          "name": "New Team",
          "slug": "new-team"
        },
        tags: ['write', 'create'],
      },
      {
        id: 'get-team',
        title: 'Get Team Details',
        method: 'GET',
        description: 'Get details of a specific team',
        tags: ['read', 'detail'],
      },
      {
        id: 'update-team',
        title: 'Update Team',
        method: 'PATCH',
        description: 'Update team name and settings',
        payload: {
          "name": "Updated Team Name",
          "description": "New team description"
        },
        tags: ['write', 'update'],
      },
      {
        id: 'list-members',
        title: 'List Team Members',
        method: 'GET',
        description: 'Get all members of the current team',
        tags: ['read', 'list', 'members'],
      },
      {
        id: 'list-members-admins',
        title: 'List Admins Only',
        method: 'GET',
        description: 'Filter members by admin role',
        tags: ['read', 'list', 'members', 'filter'],
      },
      {
        id: 'search-members',
        title: 'Search Members',
        method: 'GET',
        description: 'Search members by name or email',
        tags: ['read', 'list', 'members', 'search'],
      },
      {
        id: 'invite-member',
        title: 'Invite New Member',
        method: 'POST',
        description: 'Send invitation to join team',
        payload: {
          "email": "newuser@example.com",
          "role": "member"
        },
        tags: ['write', 'create', 'members'],
      },
      {
        id: 'invite-admin',
        title: 'Invite as Admin',
        method: 'POST',
        description: 'Invite user with admin role',
        payload: {
          "email": "admin@example.com",
          "role": "admin"
        },
        tags: ['write', 'create', 'members'],
      },
      {
        id: 'list-invitations',
        title: 'List Pending Invitations',
        method: 'GET',
        description: 'Get all pending team invitations',
        tags: ['read', 'list', 'invitations'],
      },
      {
        id: 'get-subscription',
        title: 'Get Team Subscription',
        method: 'GET',
        description: 'View current subscription details',
        tags: ['read', 'billing'],
      },
      {
        id: 'check-members-usage',
        title: 'Check Members Quota',
        method: 'GET',
        description: 'Check team member limit usage',
        tags: ['read', 'usage', 'quota'],
      },
      {
        id: 'check-storage-usage',
        title: 'Check Storage Quota',
        method: 'GET',
        description: 'Check storage limit usage',
        tags: ['read', 'usage', 'quota'],
      },
      {
        id: 'list-invoices',
        title: 'List Team Invoices',
        method: 'GET',
        description: 'Get billing invoices for the team',
        tags: ['read', 'billing', 'invoices'],
      },
      {
        id: 'switch-team',
        title: 'Switch Active Team',
        method: 'POST',
        description: 'Change the active team context',
        payload: {
          "teamId": "{{CURRENT_TEAM_ID}}"
        },
        tags: ['write', 'context'],
      }
    ]
  },
  '/api/v1/theme': {
    endpoint: '/api/v1/theme',
    summary: 'Access theme metadata and API routes',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/theme/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-themes',
        title: 'List All Themes',
        method: 'GET',
        description: 'Get all registered themes with API status',
        tags: ['read', 'list'],
      }
    ]
  },
  '/api/v1/users': {
    endpoint: '/api/v1/users',
    summary: 'Manage user profiles and team members',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/users/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'get-me',
        title: 'Get Current User',
        method: 'GET',
        description: 'Fetch the currently authenticated user profile',
        pathParams: {"id":"me"},
        tags: ['read', 'profile'],
      },
      {
        id: 'list-team-members',
        title: 'List Team Members',
        method: 'GET',
        description: 'Fetch all users in the current team',
        params: {"limit":20,"offset":0},
        tags: ['read', 'list'],
      },
      {
        id: 'update-profile',
        title: 'Update My Profile',
        method: 'PATCH',
        description: 'Update current user name',
        pathParams: {"id":"me"},
        payload: {
          "name": "Updated Name"
        },
        tags: ['write', 'profile'],
      },
      {
        id: 'search-users',
        title: 'Search Team Members',
        method: 'GET',
        description: 'Search users by name or email',
        params: {"search":"john","limit":10},
        tags: ['read', 'search'],
      }
    ]
  },
  '/api/v1/{entity}': {
    endpoint: '/api/v1/{entity}',
    summary: 'Generic CRUD operations for any registered entity',
    sourcePath: 'node_modules/@nextsparkjs/core/templates/app/api/v1/[entity]/presets.ts',
    source: 'core',
    presets: [
      {
        id: 'list-basic',
        title: 'List Entities (Basic)',
        method: 'GET',
        description: 'Fetch entities with default pagination',
        tags: ['read', 'list'],
      },
      {
        id: 'list-with-search',
        title: 'List with Search',
        method: 'GET',
        description: 'Search entities by searchable fields',
        tags: ['read', 'list', 'search'],
      },
      {
        id: 'list-with-sort',
        title: 'List with Sorting',
        method: 'GET',
        description: 'Sort entities by a specific field',
        tags: ['read', 'list', 'sort'],
      },
      {
        id: 'list-with-filter',
        title: 'List with Filter',
        method: 'GET',
        description: 'Filter entities by field value (e.g., status)',
        tags: ['read', 'list', 'filter'],
      },
      {
        id: 'list-paginated',
        title: 'List with Pagination',
        method: 'GET',
        description: 'Get second page of results',
        tags: ['read', 'list', 'pagination'],
      },
      {
        id: 'create-basic',
        title: 'Create Entity',
        method: 'POST',
        description: 'Create a new entity record',
        payload: {
          "title": "New Item",
          "status": "draft"
        },
        tags: ['write', 'create'],
      },
      {
        id: 'create-with-fields',
        title: 'Create with All Fields',
        method: 'POST',
        description: 'Create entity with multiple fields',
        payload: {
          "title": "Complete Item",
          "description": "Full description here",
          "status": "active",
          "priority": "high"
        },
        tags: ['write', 'create'],
      },
      {
        id: 'get-by-id',
        title: 'Get Entity by ID',
        method: 'GET',
        description: 'Fetch a single entity by its ID',
        tags: ['read', 'detail'],
      },
      {
        id: 'update-status',
        title: 'Update Status',
        method: 'PATCH',
        description: 'Update entity status field',
        payload: {
          "status": "completed"
        },
        tags: ['write', 'update'],
      },
      {
        id: 'update-multiple-fields',
        title: 'Update Multiple Fields',
        method: 'PATCH',
        description: 'Partial update with multiple fields',
        payload: {
          "title": "Updated Title",
          "description": "Updated description",
          "priority": "low"
        },
        tags: ['write', 'update'],
      },
      {
        id: 'delete-by-id',
        title: 'Delete Entity',
        method: 'DELETE',
        description: 'Delete an entity by ID',
        tags: ['write', 'delete'],
      },
      {
        id: 'list-children',
        title: 'List Child Entities',
        method: 'GET',
        description: 'Get all child entities for a parent',
        tags: ['read', 'list', 'children'],
      },
      {
        id: 'create-child',
        title: 'Create Child Entity',
        method: 'POST',
        description: 'Add a new child record to parent',
        payload: {
          "name": "New Child Item",
          "value": 100
        },
        tags: ['write', 'create', 'children'],
      },
      {
        id: 'get-child',
        title: 'Get Child Entity',
        method: 'GET',
        description: 'Fetch a specific child entity',
        tags: ['read', 'detail', 'children'],
      },
      {
        id: 'update-child',
        title: 'Update Child Entity',
        method: 'PATCH',
        description: 'Update a child entity',
        payload: {
          "name": "Updated Child",
          "value": 200
        },
        tags: ['write', 'update', 'children'],
      },
      {
        id: 'delete-child',
        title: 'Delete Child Entity',
        method: 'DELETE',
        description: 'Delete a child entity',
        tags: ['write', 'delete', 'children'],
      }
    ]
  }
  },
  meta: {
    totalEndpoints: 17,
    totalPresets: 95,
    generatedAt: '2026-05-31T16:00:45.261Z',
    themeName: 'barbercrm'
  }
}

/**
 * Get presets for a specific endpoint
 * Supports exact match and glob pattern matching
 */
export function getPresetsForEndpoint(endpoint: string): ApiEndpointPresets | undefined {
  // Try exact match first
  if (API_PRESETS_REGISTRY.endpoints[endpoint]) {
    return API_PRESETS_REGISTRY.endpoints[endpoint]
  }

  // Try glob pattern matching
  for (const [pattern, config] of Object.entries(API_PRESETS_REGISTRY.endpoints)) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
      if (regex.test(endpoint)) {
        return config
      }
    }
  }

  return undefined
}

/**
 * Get presets filtered by endpoint and method
 */
export function getPresetsByMethod(endpoint: string, method: string): ApiPreset[] {
  const config = getPresetsForEndpoint(endpoint)
  if (!config) return []
  return config.presets.filter(p => p.method === method)
}

/**
 * Get all endpoint presets
 */
export function getAllPresets(): ApiEndpointPresets[] {
  return Object.values(API_PRESETS_REGISTRY.endpoints)
}

/**
 * Check if endpoint has presets
 */
export function hasPresets(endpoint: string): boolean {
  return !!getPresetsForEndpoint(endpoint)
}
