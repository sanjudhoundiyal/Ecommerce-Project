package com.E_commers.Repository;

import com.E_commers.Entity.AddMore;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AddmoreAddressREpo extends JpaRepository<AddMore, Long> {

    List<AddMore> findByUser_Id(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AddMore a WHERE a.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
