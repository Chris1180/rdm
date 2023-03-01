package eu.europa.europarl.csio.elegislate.security;



import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping
public class AuthenticationRestAPI {

	@GetMapping({"/auth","/form/auth"})
	public Authentication getAuthContext() {
		return SecurityContextHolder.getContext().getAuthentication();
		
	}

}

