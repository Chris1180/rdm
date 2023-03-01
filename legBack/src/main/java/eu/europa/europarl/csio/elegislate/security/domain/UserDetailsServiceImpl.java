package eu.europa.europarl.csio.elegislate.security.domain;


import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Service;

import eu.europa.europarl.csio.elegislate.security.*;







@Service
@Transactional
public class UserDetailsServiceImpl implements UserDetailsService, AuthenticationUserDetailsService<PreAuthenticatedAuthenticationToken> {
	
	
	@Autowired
	private SecurityService securityService;

	@Override
	public UserDetails loadUserDetails(PreAuthenticatedAuthenticationToken token) throws UsernameNotFoundException {
		String username = ((Principal)token.getPrincipal()).getName();
		
		return this.loadUserByUsername(username) ;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Person person = securityService.findPersonByUsername(username)
				.orElseThrow(() -> {
					
					return new UsernameNotFoundException("Username not found: " + username);
				});
		
		List<SystemPermission> sysPerms = person.getSystemPermissions();
		
		List<RoleEnum> roles = sysPerms.stream().map(p -> p.getRole().getType()).distinct().collect(Collectors.toList());
		
		//System.out.println("Voici la liste des rôles de userdetails: "+roles);
		//System.out.println("Voici la valeur de username: "+username);
		
		return new UserDetails(username, "password", person.getFirstName(), person.getLastName(), person.getEmail(), roles) ;
	}

} 
