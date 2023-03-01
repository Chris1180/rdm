package eu.europa.europarl.csio.elegislate.security.domain;

import org.springframework.security.core.GrantedAuthority;

public enum RoleEnum implements GrantedAuthority {

	// SYSTEM ROLES
	SYS_ADMIN(true), SYS_PROJECT(true), SYS_REPORT(true),

	// APPLICATION ROLES
	PROJECT_MANAGER(false), PROJECT_DELEGATE(false), PROJECT_SPONSOR(false);
	
	private boolean system;
	
	private RoleEnum(boolean system) {
		this.system = system;
	}
	
	@Override
	public String getAuthority() {
		return name();
	}
	
	public boolean isSystem() {
		return system;
	}

	// ROLES POSSIBILITIES
	public static RoleEnum[] projectAdministrators() {
		return new RoleEnum[] { SYS_ADMIN, SYS_PROJECT };
	}
	
	public static RoleEnum[] projectRoles() {
		return new RoleEnum[] { PROJECT_SPONSOR, PROJECT_MANAGER, PROJECT_DELEGATE };
	};
	
	public static RoleEnum[] projectManagers() {
		return new RoleEnum[] { PROJECT_MANAGER, PROJECT_DELEGATE };
	}

}
